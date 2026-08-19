// Beschreibung: Persistente MCP-first Compilation Inbox mit plugin-only Decision und Recovery-Saga.
// Artefakte:    US-000017; US-000008; ADR-000007
// Agent:        BE — 2026-08-15
import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ZodError } from 'zod';
import {
  CompilationDecisionRequestSchema,
  CompilationDecisionResultSchema,
  CompilationStatusRequestSchema,
  CompilationStatusSchema,
  CompilationSubmissionSchema,
  CompilationSubmitRequestSchema,
  OperationHistoryRequestSchema,
  OperationHistorySchema,
  PendingCompilationDetailRequestSchema,
  PendingCompilationDetailSchema,
  PendingCompilationListRequestSchema,
  PendingCompilationListSchema,
  PendingCompilationSummarySchema,
  type CompilationDecisionResult,
  type CompilationErrorCode,
  type CompilationStatus,
  type CompilationSubmission,
  type OperationHistory,
  type PendingCompilationDetail,
  type PendingCompilationList,
  type PendingCompilationSummary
} from '@second-brain/contracts';

const PENDING_TTL_MS = 24 * 60 * 60 * 1_000;
const DECISION_TTL_MS = 15 * 60 * 1_000;
const MAX_PENDING = 50;
const MAX_ACTIVE_PAYLOAD_BYTES = 64 * 1_024 * 1_024;
type Clock = () => number;
type DecisionCapability = 'plugin:compilation:decide';
type FileOperations = {
  read(path: string): Promise<string | null>;
  write(path: string, content: string): Promise<void>;
};

const defaultFiles: FileOperations = { read: readExisting, write: atomicWrite };

export class CompilationInboxError extends Error {
  public constructor(public readonly code: CompilationErrorCode, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'CompilationInboxError';
  }
}

// Implementiert: US-000017 — MCP-first Pending Compilation
// Implementiert: US-000008 — wahrheitsgetreue lokale Mutationshistorie
export class CompilationInboxService {
  private readonly database: DatabaseSync;
  private readonly vaultId: string;

  /** Opens and migrates the durable inbox for one server-bound client and vault. */
  public constructor(
    private readonly vaultRoot: string,
    databasePath: string,
    private readonly clientId: string,
    private readonly clientName: string,
    private readonly clock: Clock = Date.now,
    private readonly files: FileOperations = defaultFiles
  ) {
    this.database = new DatabaseSync(databasePath);
    this.vaultId = hashOf(vaultRoot);
    this.migrate();
  }

  /** Closes the local SQLite handle. */
  public close(): void {
    this.database.close();
  }

  /** Recovers interrupted APPLYING operations without overwriting newer vault content. */
  public async recoverApplying(): Promise<void> {
    const rows = this.database.prepare(`
      SELECT r.pending_id, r.target_path, r.before_hash, r.after_hash, p.before_content
      FROM compilation_requests r
      JOIN compilation_payloads p ON p.pending_id = r.pending_id
      WHERE r.vault_id = ? AND r.state = 'applying'
    `).all(this.vaultId);
    for (const row of rows) {
      // A create interrupted before its first write legitimately has no target yet.
      const target = await this.resolveTarget(String(row['target_path']), 'COMPILATION_INVALID_TARGET', true);
      const currentHash = hashNullable(await this.files.read(target.absolutePath));
      if (currentHash === String(row['after_hash'])) {
        this.finalizeConfirmed(String(row['pending_id']));
      } else {
        const code = currentHash === nullableString(row['before_hash']) ? null : 'COMPILATION_DRIFT';
        this.finishWithoutSuccess(String(row['pending_id']), 'incomplete', code);
      }
    }
  }

  /** Stores an idempotent MCP proposal without returning any decision capability. */
  public async submit(input: unknown): Promise<CompilationSubmission> {
    await this.recoverApplying();
    this.expirePending();
    let request: ReturnType<typeof CompilationSubmitRequestSchema.parse>;
    try {
      request = CompilationSubmitRequestSchema.parse(input);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const sourceIssue = error.issues.some((issue) => issue.path[0] === 'sources');
        throw new CompilationInboxError(
          sourceIssue ? 'COMPILATION_INVALID_SOURCE' : 'COMPILATION_INVALID_TARGET',
          sourceIssue ? 'One or more compilation sources are invalid.' : 'The compilation target is invalid.',
          error
        );
      }
      throw error;
    }
    const payloadHash = hashOf(JSON.stringify(request));
    const previous = this.database.prepare(`
      SELECT pending_id, payload_hash, state, revision, created_at, expires_at
      FROM compilation_requests
      WHERE client_id = ? AND vault_id = ? AND client_request_id = ?
    `).get(this.clientId, this.vaultId, request.clientRequestId);
    if (previous) {
      if (String(previous['payload_hash']) !== payloadHash) {
        throw new CompilationInboxError('IDEMPOTENCY_CONFLICT', 'This clientRequestId already belongs to different content.');
      }
      if (String(previous['state']) !== 'pending') {
        throw new CompilationInboxError('CONFIRMATION_ALREADY_DECIDED', 'This proposal is already terminal. Use a new clientRequestId.');
      }
      return CompilationSubmissionSchema.parse({
        pendingId: previous['pending_id'], state: 'pending', revision: previous['revision'],
        createdAt: previous['created_at'], expiresAt: previous['expires_at']
      });
    }
    this.assertCapacity(Buffer.byteLength(request.target.content, 'utf8'));
    const target = await this.resolveTarget(request.target.relativePath, 'COMPILATION_INVALID_TARGET', true);
    const before = await this.files.read(target.absolutePath);
    if (before === request.target.content) {
      throw new CompilationInboxError('COMPILATION_INVALID_TARGET', 'The proposed target content is unchanged.');
    }
    const sources: Array<{ relativePath: string; hash: string; content: string }> = [];
    for (const source of request.sources) {
      const resolved = await this.resolveTarget(source.relativePath, 'COMPILATION_INVALID_SOURCE', false);
      const content = await this.files.read(resolved.absolutePath);
      if (content === null || hashOf(content) !== source.expectedHash) {
        throw new CompilationInboxError('COMPILATION_INVALID_SOURCE', `Source ${source.relativePath} is missing or changed.`);
      }
      sources.push({ relativePath: resolved.relativePath, hash: source.expectedHash, content });
    }
    if (request.template !== null) await this.assertTemplate(request.template.id, request.template.version, request.template.hash);
    const warnings = detectWarnings(sources.map((source) => source.content));
    const now = new Date(this.clock()).toISOString();
    const expiresAt = new Date(this.clock() + PENDING_TTL_MS).toISOString();
    const pendingId = randomUUID();
    const beforeHash = hashNullable(before);
    const afterHash = hashOf(request.target.content);
    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.prepare(`
        INSERT INTO compilation_requests(
          pending_id, client_id, client_name, vault_id, client_request_id, payload_hash,
          state, revision, target_path, before_hash, after_hash, template_id, template_version,
          template_hash, warnings_json, created_at, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', 1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        pendingId, this.clientId, this.clientName, this.vaultId, request.clientRequestId, payloadHash,
        target.relativePath, beforeHash, afterHash, request.template?.id ?? null,
        request.template?.version ?? null, request.template?.hash ?? null, JSON.stringify(warnings), now, expiresAt
      );
      this.database.prepare(`
        INSERT INTO compilation_payloads(pending_id, candidate_content, before_content, diff, payload_bytes)
        VALUES (?, ?, ?, ?, ?)
      `).run(pendingId, request.target.content, before, createTextDiff(before ?? '', request.target.content), Buffer.byteLength(request.target.content, 'utf8'));
      const insertSource = this.database.prepare(`
        INSERT INTO compilation_sources(pending_id, ordinal, relative_path, expected_hash, observed_hash)
        VALUES (?, ?, ?, ?, ?)
      `);
      sources.forEach((source, ordinal) => insertSource.run(pendingId, ordinal, source.relativePath, source.hash, source.hash));
      this.appendEvent(pendingId, 'pending', now, null);
      this.database.exec('COMMIT');
    } catch (error: unknown) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    return CompilationSubmissionSchema.parse({ pendingId, state: 'pending', revision: 1, createdAt: now, expiresAt });
  }

  /** Returns status only for proposals owned by the server-bound MCP client. */
  public status(input: unknown): CompilationStatus {
    const request = CompilationStatusRequestSchema.parse(input);
    this.expirePending();
    const row = this.database.prepare(`
      SELECT pending_id, state, revision, error_code, decided_at FROM compilation_requests
      WHERE pending_id = ? AND client_id = ? AND vault_id = ?
    `).get(request.pendingId, this.clientId, this.vaultId);
    if (!row) throw new CompilationInboxError('COMPILATION_INVALID_TARGET', 'The requested proposal does not exist for this client and vault.');
    return CompilationStatusSchema.parse({
      pendingId: row['pending_id'], state: row['state'], revision: row['revision'],
      errorCode: row['error_code'], decidedAt: row['decided_at']
    });
  }

  /** Returns the small polling projection used by the Obsidian badge. */
  public summary(): PendingCompilationSummary {
    this.expirePending();
    const row = this.database.prepare(`
      SELECT COUNT(*) AS count, COALESCE(MAX(revision), 0) AS revision, MIN(expires_at) AS oldest
      FROM compilation_requests WHERE vault_id = ? AND state = 'pending'
    `).get(this.vaultId);
    return PendingCompilationSummarySchema.parse({ count: row?.['count'] ?? 0, revision: row?.['revision'] ?? 0, oldestExpiresAt: row?.['oldest'] ?? null });
  }

  /** Lists pending metadata without candidate content or decision tokens. */
  public list(input: unknown): PendingCompilationList {
    const request = PendingCompilationListRequestSchema.parse(input);
    this.expirePending();
    const rows = this.database.prepare(`
      SELECT r.pending_id, r.revision, r.target_path, r.client_name, r.warnings_json,
             r.created_at, r.expires_at, COUNT(s.ordinal) AS source_count
      FROM compilation_requests r
      JOIN compilation_sources s ON s.pending_id = r.pending_id
      WHERE r.vault_id = ? AND r.state = 'pending' AND (? IS NULL OR r.created_at < ?)
      GROUP BY r.pending_id ORDER BY r.created_at DESC LIMIT ?
    `).all(this.vaultId, request.cursor ?? null, request.cursor ?? null, request.limit + 1);
    const page = rows.slice(0, request.limit);
    return PendingCompilationListSchema.parse({
      items: page.map((row) => ({
        pendingId: row['pending_id'], revision: row['revision'], targetPath: row['target_path'],
        clientName: row['client_name'], sourceCount: row['source_count'],
        warningCount: (JSON.parse(String(row['warnings_json'])) as unknown[]).length,
        createdAt: row['created_at'], expiresAt: row['expires_at']
      })),
      nextCursor: rows.length > request.limit ? String(page.at(-1)?.['created_at']) : null
    });
  }

  /** Revalidates a pending proposal and rotates its short-lived plugin decision token. */
  public async detail(input: unknown): Promise<PendingCompilationDetail> {
    const request = PendingCompilationDetailRequestSchema.parse(input);
    await this.recoverApplying();
    this.expirePending();
    const row = this.readPending(request.pendingId);
    await this.assertNoDrift(row);
    const token = randomUUID();
    const tokenExpires = new Date(this.clock() + DECISION_TTL_MS).toISOString();
    this.database.prepare(`
      UPDATE compilation_requests SET decision_token_hash = ?, decision_expires_at = ?, revision = revision + 1
      WHERE pending_id = ? AND state = 'pending'
    `).run(hashOf(token), tokenExpires, request.pendingId);
    const updated = this.readPending(request.pendingId);
    const payload = this.database.prepare('SELECT * FROM compilation_payloads WHERE pending_id = ?').get(request.pendingId);
    const sources = this.database.prepare(`SELECT relative_path, observed_hash FROM compilation_sources WHERE pending_id = ? ORDER BY ordinal`).all(request.pendingId);
    const warnings = JSON.parse(String(updated['warnings_json'])) as unknown;
    return PendingCompilationDetailSchema.parse({
      pendingId: updated['pending_id'], revision: updated['revision'], state: updated['state'], clientName: updated['client_name'],
      targetPath: updated['target_path'], beforeHash: updated['before_hash'], afterHash: updated['after_hash'],
      content: payload?.['candidate_content'], diff: payload?.['diff'],
      sources: sources.map((source) => ({ relativePath: source['relative_path'], hash: source['observed_hash'] })),
      template: updated['template_id'] === null ? null : { id: updated['template_id'], version: updated['template_version'], hash: updated['template_hash'] },
      warnings, decisionToken: token, decisionExpiresAt: tokenExpires,
      createdAt: updated['created_at'], expiresAt: updated['expires_at']
    });
  }

  /** Consumes one plugin-only confirm or reject decision exactly once. */
  public async decide(input: unknown, capability: DecisionCapability): Promise<CompilationDecisionResult> {
    if (capability !== 'plugin:compilation:decide') {
      throw new CompilationInboxError('CONFIRMATION_ALREADY_DECIDED', 'Compilation decisions are available only to the local Obsidian plugin.');
    }
    const request = CompilationDecisionRequestSchema.parse(input);
    await this.recoverApplying();
    this.expirePending();
    const row = this.readPending(request.pendingId);
    if (Number(row['revision']) !== request.revision) {
      throw new CompilationInboxError('CONFIRMATION_ALREADY_DECIDED', 'The review revision is stale. Reload the proposal.');
    }
    if (row['decision_token_hash'] !== hashOf(request.decisionToken)) {
      throw new CompilationInboxError('CONFIRMATION_ALREADY_DECIDED', 'The decision token is invalid or has been rotated.');
    }
    if (Date.parse(String(row['decision_expires_at'])) <= this.clock()) {
      throw new CompilationInboxError('CONFIRMATION_EXPIRED', 'The decision token expired. Reload the proposal.');
    }
    await this.assertNoDrift(row);
    const decidedAt = new Date(this.clock()).toISOString();
    if (request.decision === 'reject') {
      this.database.exec('BEGIN IMMEDIATE');
      try {
        const claim = this.database.prepare(`
          UPDATE compilation_requests SET state = 'rejected', revision = revision + 1, decided_at = ?, decision_token_hash = NULL
          WHERE pending_id = ? AND state = 'pending' AND revision = ? AND decision_token_hash = ?
        `).run(decidedAt, request.pendingId, request.revision, hashOf(request.decisionToken));
        if (claim.changes !== 1) throw new CompilationInboxError('CONFIRMATION_ALREADY_DECIDED', 'This proposal was already decided.');
        this.appendEvent(request.pendingId, 'rejected', decidedAt, null);
        this.database.prepare('DELETE FROM compilation_payloads WHERE pending_id = ?').run(request.pendingId);
        this.database.exec('COMMIT');
      } catch (error: unknown) {
        this.database.exec('ROLLBACK');
        throw error;
      }
      return CompilationDecisionResultSchema.parse({ pendingId: request.pendingId, state: 'rejected', revision: request.revision + 1, auditId: null, decidedAt });
    }
    const payload = this.database.prepare('SELECT * FROM compilation_payloads WHERE pending_id = ?').get(request.pendingId);
    if (!payload) throw new CompilationInboxError('COMPILATION_DRIFT', 'The proposal payload is unavailable. Submit a new proposal.');
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const claim = this.database.prepare(`
        UPDATE compilation_requests SET state = 'applying', revision = revision + 1,
          decided_at = ?, decision_token_hash = NULL
        WHERE pending_id = ? AND state = 'pending' AND revision = ? AND decision_token_hash = ?
      `).run(decidedAt, request.pendingId, request.revision, hashOf(request.decisionToken));
      if (claim.changes !== 1) throw new CompilationInboxError('CONFIRMATION_ALREADY_DECIDED', 'This proposal was already decided.');
      this.appendEvent(request.pendingId, 'applying', decidedAt, null);
      this.database.exec('COMMIT');
    } catch (error: unknown) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    const target = await this.resolveTarget(String(row['target_path']), 'COMPILATION_INVALID_TARGET', true);
    try {
      await this.files.write(target.absolutePath, String(payload['candidate_content']));
    } catch (error: unknown) {
      this.finishWithoutSuccess(request.pendingId, 'failed', null);
      throw error;
    }
    // The Vault now contains the reviewed after-state. Preserve APPLYING and its payload if
    // audit finalization fails so startup recovery can truthfully finalize from the hash.
    return this.finalizeConfirmed(request.pendingId);
  }

  /** Returns a cursor-based truthful projection of compilation operations. */
  public history(input: unknown): OperationHistory {
    const request = OperationHistoryRequestSchema.parse(input);
    const compilationRows = this.database.prepare(`
      SELECT pending_id, target_path, state, created_at, decided_at, error_code, audit_id
      FROM compilation_requests
      WHERE vault_id = ? AND (? IS NULL OR created_at < ?)
      ORDER BY created_at DESC LIMIT 201
    `).all(this.vaultId, request.cursor ?? null, request.cursor ?? null);
    const entries: Array<Record<string, unknown>> = compilationRows.map((row) => {
      const auditId = nullableString(row['audit_id']);
      const rolledBack = auditId !== null && this.tableExists('mutation_audit') &&
        Boolean(this.database.prepare('SELECT 1 FROM mutation_audit WHERE source_audit_id = ?').get(auditId));
      return {
        operationId: row['pending_id'], kind: 'compilation', targetPath: row['target_path'],
        status: row['state'] === 'confirmed' ? 'success' : row['state'],
        rollbackStatus: row['state'] === 'confirmed' ? rolledBack ? 'rolled-back' : 'available' : 'not-applicable',
        createdAt: row['created_at'], completedAt: row['decided_at'], errorCode: row['error_code'], auditId
      };
    });
    if (this.tableExists('mutation_audit')) {
      const mutationRows = this.database.prepare(`
        SELECT audit_id, action, relative_path, source_audit_id, created_at
        FROM mutation_audit
        WHERE (? IS NULL OR created_at < ?)
          AND audit_id NOT IN (SELECT COALESCE(audit_id, '') FROM compilation_requests)
        ORDER BY created_at DESC LIMIT 201
      `).all(request.cursor ?? null, request.cursor ?? null);
      for (const row of mutationRows) {
        const auditId = String(row['audit_id']);
        const isRollback = row['source_audit_id'] !== null || row['action'] === 'rollback';
        const rolledBack = !isRollback && Boolean(this.database.prepare('SELECT 1 FROM mutation_audit WHERE source_audit_id = ?').get(auditId));
        entries.push({
          operationId: auditId, kind: isRollback ? 'rollback' : 'mutation', targetPath: row['relative_path'], status: 'success',
          rollbackStatus: isRollback ? 'not-applicable' : rolledBack ? 'rolled-back' : 'available',
          createdAt: row['created_at'], completedAt: row['created_at'], errorCode: null, auditId
        });
      }
    }
    entries.sort((left, right) => String(right['createdAt']).localeCompare(String(left['createdAt'])));
    const page = entries.slice(0, request.limit);
    return OperationHistorySchema.parse({
      entries: page,
      nextCursor: entries.length > request.limit ? String(page.at(-1)?.['createdAt']) : null
    });
  }

  private migrate(): void {
    this.database.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS compilation_requests(
        pending_id TEXT PRIMARY KEY, client_id TEXT NOT NULL, client_name TEXT NOT NULL, vault_id TEXT NOT NULL,
        client_request_id TEXT NOT NULL, payload_hash TEXT NOT NULL, state TEXT NOT NULL, revision INTEGER NOT NULL,
        target_path TEXT NOT NULL, before_hash TEXT, after_hash TEXT NOT NULL, template_id TEXT, template_version INTEGER,
        template_hash TEXT, warnings_json TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL,
        decided_at TEXT, error_code TEXT, audit_id TEXT, decision_token_hash TEXT, decision_expires_at TEXT,
        UNIQUE(client_id, vault_id, client_request_id)
      );
      CREATE TABLE IF NOT EXISTS compilation_payloads(
        pending_id TEXT PRIMARY KEY REFERENCES compilation_requests(pending_id) ON DELETE CASCADE,
        candidate_content TEXT NOT NULL, before_content TEXT, diff TEXT NOT NULL, payload_bytes INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS compilation_sources(
        pending_id TEXT NOT NULL REFERENCES compilation_requests(pending_id) ON DELETE CASCADE,
        ordinal INTEGER NOT NULL, relative_path TEXT NOT NULL, expected_hash TEXT NOT NULL, observed_hash TEXT NOT NULL,
        PRIMARY KEY(pending_id, ordinal)
      );
      CREATE TABLE IF NOT EXISTS compilation_events(
        pending_id TEXT NOT NULL REFERENCES compilation_requests(pending_id) ON DELETE CASCADE,
        revision INTEGER NOT NULL, state TEXT NOT NULL, created_at TEXT NOT NULL, error_code TEXT,
        PRIMARY KEY(pending_id, revision)
      );
      CREATE TABLE IF NOT EXISTS template_registry(
        template_id TEXT NOT NULL, name TEXT NOT NULL, version INTEGER NOT NULL, hash TEXT NOT NULL,
        file_path TEXT NOT NULL, created_at TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'ready',
        PRIMARY KEY(template_id, version)
      );
      CREATE INDEX IF NOT EXISTS compilation_requests_inbox ON compilation_requests(vault_id, state, created_at DESC);
      INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES (6, datetime('now'));
    `);
    if (this.tableExists('compilation_bindings')) {
      this.database.exec('DELETE FROM compilation_bindings WHERE token NOT IN (SELECT token FROM mutation_previews)');
    }
  }

  private tableExists(name: string): boolean {
    return Boolean(this.database.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name));
  }

  private expirePending(): void {
    const now = new Date(this.clock()).toISOString();
    const expired = this.database.prepare(`SELECT pending_id FROM compilation_requests WHERE vault_id = ? AND state = 'pending' AND expires_at <= ?`).all(this.vaultId, now);
    for (const row of expired) this.finishWithoutSuccess(String(row['pending_id']), 'expired', 'CONFIRMATION_EXPIRED');
  }

  private assertCapacity(newBytes: number): void {
    const count = Number(this.database.prepare(`SELECT COUNT(*) AS count FROM compilation_requests WHERE vault_id = ? AND state IN ('pending', 'applying')`).get(this.vaultId)?.['count'] ?? 0);
    const bytes = Number(this.database.prepare(`
      SELECT COALESCE(SUM(p.payload_bytes), 0) AS bytes FROM compilation_payloads p
      JOIN compilation_requests r ON r.pending_id = p.pending_id
      WHERE r.vault_id = ? AND r.state IN ('pending', 'applying')
    `).get(this.vaultId)?.['bytes'] ?? 0);
    if (count >= MAX_PENDING || bytes + newBytes > MAX_ACTIVE_PAYLOAD_BYTES) {
      throw new CompilationInboxError('PENDING_CAPACITY_REACHED', 'The review inbox is full. Review or reject existing proposals first.');
    }
  }

  private async assertTemplate(id: string, version: number, hash: string): Promise<void> {
    const registry = this.database.prepare(`SELECT file_path, hash FROM template_registry WHERE template_id = ? AND version = ? AND hash = ? AND state = 'ready'`).get(id, version, hash);
    const legacy = this.tableExists('template_versions')
      ? this.database.prepare('SELECT 1 FROM template_versions WHERE id = ? AND version = ? AND hash = ?').get(id, version, hash)
      : null;
    if (!registry && !legacy) throw new CompilationInboxError('COMPILATION_TEMPLATE_NOT_FOUND', 'The referenced template version is missing or changed.');
    if (registry) {
      try {
        const content = await readFile(join(this.vaultRoot, '.second-brain', 'templates', String(registry['file_path'])), 'utf8');
        if (hashOf(content) !== String(registry['hash'])) throw new Error('Template content hash differs from the registry.');
      } catch (error: unknown) {
        throw new CompilationInboxError('COMPILATION_TEMPLATE_NOT_FOUND', 'The referenced template version is missing or changed.', error);
      }
    }
  }

  private readPending(pendingId: string): Record<string, unknown> {
    const row = this.database.prepare(`SELECT * FROM compilation_requests WHERE pending_id = ? AND vault_id = ?`).get(pendingId, this.vaultId);
    if (!row) throw new CompilationInboxError('COMPILATION_INVALID_TARGET', 'The pending compilation does not exist.');
    const state = String(row['state']);
    if (state === 'expired') throw new CompilationInboxError('CONFIRMATION_EXPIRED', 'This review expired. Submit a new proposal.');
    if (state !== 'pending') throw new CompilationInboxError('CONFIRMATION_ALREADY_DECIDED', `This proposal is already ${state}.`);
    return row;
  }

  private async assertNoDrift(row: Record<string, unknown>): Promise<void> {
    const target = await this.resolveTarget(String(row['target_path']), 'COMPILATION_INVALID_TARGET', true);
    if (hashNullable(await this.files.read(target.absolutePath)) !== nullableString(row['before_hash'])) {
      this.finishWithoutSuccess(String(row['pending_id']), 'conflicted', 'COMPILATION_DRIFT');
      throw new CompilationInboxError('COMPILATION_DRIFT', 'The target note changed after submission. Submit a new proposal.');
    }
    const sources = this.database.prepare('SELECT relative_path, observed_hash FROM compilation_sources WHERE pending_id = ? ORDER BY ordinal').all(String(row['pending_id']));
    for (const source of sources) {
      const resolved = await this.resolveTarget(String(source['relative_path']), 'COMPILATION_INVALID_SOURCE', false);
      if (hashNullable(await this.files.read(resolved.absolutePath)) !== String(source['observed_hash'])) {
        this.finishWithoutSuccess(String(row['pending_id']), 'conflicted', 'COMPILATION_DRIFT');
        throw new CompilationInboxError('COMPILATION_DRIFT', `Source ${String(source['relative_path'])} changed after submission.`);
      }
    }
    const templateId = nullableString(row['template_id']);
    const templateHash = nullableString(row['template_hash']);
    if (templateId !== null && templateHash !== null) {
      try {
        await this.assertTemplate(templateId, Number(row['template_version']), templateHash);
      } catch (error: unknown) {
        this.finishWithoutSuccess(String(row['pending_id']), 'conflicted', 'COMPILATION_DRIFT');
        throw new CompilationInboxError('COMPILATION_DRIFT', `Template ${templateId} changed or is unavailable. Ask your AI client for a new proposal.`, error);
      }
    }
  }

  private finalizeConfirmed(pendingId: string): CompilationDecisionResult {
    const row = this.database.prepare(`SELECT * FROM compilation_requests WHERE pending_id = ?`).get(pendingId);
    if (!row) throw new CompilationInboxError('COMPILATION_INVALID_TARGET', 'The applying proposal no longer exists.');
    if (row['state'] === 'confirmed') {
      return CompilationDecisionResultSchema.parse({ pendingId, state: 'confirmed', revision: row['revision'], auditId: row['audit_id'], decidedAt: row['decided_at'] });
    }
    const payload = this.database.prepare('SELECT * FROM compilation_payloads WHERE pending_id = ?').get(pendingId);
    if (!payload) throw new CompilationInboxError('COMPILATION_DRIFT', 'Recovery payload is missing.');
    const auditId = randomUUID();
    const completedAt = new Date(this.clock()).toISOString();
    this.database.exec('BEGIN IMMEDIATE');
    try {
      if (this.tableExists('mutation_audit')) {
        this.database.prepare(`
          INSERT OR IGNORE INTO mutation_audit(audit_id, action, relative_path, before_hash, after_hash, before_content, after_content, source_audit_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)
        `).run(
          auditId,
          row['before_hash'] === null ? 'create' : 'update',
          String(row['target_path']),
          nullableString(row['before_hash']),
          String(row['after_hash']),
          nullableString(payload['before_content']),
          String(payload['candidate_content']),
          completedAt
        );
      }
      this.database.prepare(`UPDATE compilation_requests SET state = 'confirmed', revision = revision + 1, audit_id = ?, decided_at = ? WHERE pending_id = ? AND state = 'applying'`).run(auditId, completedAt, pendingId);
      const updated = this.database.prepare('SELECT revision FROM compilation_requests WHERE pending_id = ?').get(pendingId);
      this.appendEvent(pendingId, 'confirmed', completedAt, null);
      this.database.prepare('DELETE FROM compilation_payloads WHERE pending_id = ?').run(pendingId);
      this.database.exec('COMMIT');
      return CompilationDecisionResultSchema.parse({ pendingId, state: 'confirmed', revision: updated?.['revision'], auditId, decidedAt: completedAt });
    } catch (error: unknown) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  private finishWithoutSuccess(pendingId: string, state: 'rejected' | 'failed' | 'incomplete' | 'conflicted' | 'expired', errorCode: CompilationErrorCode | null): void {
    const completedAt = new Date(this.clock()).toISOString();
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const changed = this.database.prepare(`
        UPDATE compilation_requests SET state = ?, revision = revision + 1, decided_at = ?, error_code = ?, decision_token_hash = NULL
        WHERE pending_id = ? AND state IN ('pending', 'applying')
      `).run(state, completedAt, errorCode, pendingId);
      if (changed.changes === 1) {
        this.appendEvent(pendingId, state, completedAt, errorCode);
        this.database.prepare('DELETE FROM compilation_payloads WHERE pending_id = ?').run(pendingId);
      }
      this.database.exec('COMMIT');
    } catch (error: unknown) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  private appendEvent(pendingId: string, state: string, createdAt: string, errorCode: CompilationErrorCode | null): void {
    const revision = Number(this.database.prepare('SELECT revision FROM compilation_requests WHERE pending_id = ?').get(pendingId)?.['revision'] ?? 1);
    this.database.prepare(`INSERT OR IGNORE INTO compilation_events(pending_id, revision, state, created_at, error_code) VALUES (?, ?, ?, ?, ?)`).run(pendingId, revision, state, createdAt, errorCode);
  }

  private async resolveTarget(requestedPath: string, code: 'COMPILATION_INVALID_SOURCE' | 'COMPILATION_INVALID_TARGET', allowMissing: boolean): Promise<{ absolutePath: string; relativePath: string }> {
    if (isAbsolute(requestedPath) || extname(requestedPath).toLowerCase() !== '.md') throw new CompilationInboxError(code, 'Only one vault-relative Markdown path is allowed.');
    const absolutePath = resolve(this.vaultRoot, requestedPath);
    const relation = relative(this.vaultRoot, absolutePath);
    if (!relation || relation === '..' || relation.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) || relation.split(/[\\/]/u).some((part) => part === '.obsidian' || part === '.second-brain')) {
      throw new CompilationInboxError(code, 'The path leaves the approved vault or enters a reserved directory.');
    }
    let existingParent = dirname(absolutePath);
    while (existingParent !== this.vaultRoot) {
      try { existingParent = await realpath(existingParent); break; } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        const parent = dirname(existingParent);
        if (parent === existingParent) break;
        existingParent = parent;
      }
    }
    const canonicalParent = await realpath(existingParent);
    const parentRelation = relative(this.vaultRoot, canonicalParent);
    if (parentRelation === '..' || parentRelation.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)) throw new CompilationInboxError(code, 'The path resolves outside the approved vault.');
    try {
      const stat = await lstat(absolutePath);
      if (!stat.isFile() || stat.isSymbolicLink()) throw new CompilationInboxError(code, 'Symlink and non-file targets are blocked.');
    } catch (error: unknown) {
      if (error instanceof CompilationInboxError) throw error;
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT' || !allowMissing) throw new CompilationInboxError(code, `Markdown file ${requestedPath} does not exist.`, error);
    }
    return { absolutePath, relativePath: relation.replaceAll('\\', '/') };
  }
}

function detectWarnings(contents: readonly string[]): Array<'untrusted-instruction-like-content' | 'potentially-contradictory-sources'> {
  const warnings: Array<'untrusted-instruction-like-content' | 'potentially-contradictory-sources'> = [];
  if (contents.some((content) => /ignore (?:previous|all) instructions|system prompt|tool call|run command/iu.test(content))) warnings.push('untrusted-instruction-like-content');
  if (contents.some((content) => /\bcontradict(?:s|ory|ion)?\b/iu.test(content))) warnings.push('potentially-contradictory-sources');
  return warnings;
}

function hashOf(content: string): string { return createHash('sha256').update(content, 'utf8').digest('hex'); }
function hashNullable(content: string | null): string | null { return content === null ? null : hashOf(content); }
function nullableString(value: unknown): string | null { return typeof value === 'string' ? value : null; }
function createTextDiff(before: string, after: string): string {
  return [...before.split(/\r?\n/u).map((line) => `- ${line}`), ...after.split(/\r?\n/u).map((line) => `+ ${line}`)].join('\n');
}
async function readExisting(path: string): Promise<string | null> {
  try { return await readFile(path, 'utf8'); } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}
async function atomicWrite(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.second-brain-${randomUUID()}.tmp`;
  try { await writeFile(temporary, content, { encoding: 'utf8', flag: 'wx' }); await rename(temporary, path); }
  catch (error: unknown) { await rm(temporary, { force: true }); throw error; }
}
