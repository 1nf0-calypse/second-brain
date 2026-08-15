// Beschreibung: Kontrollierte Mutationen mit Human-in/out-Policy, Audit und Rollback.
// Artefakte:    US-000003; US-000014; ADR-000003; ADR-000004
// Agent:        BE — 2026-08-13
import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, relative, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  MutationPreviewSchema,
  MutationResultSchema,
  AutonomyActivationRequestSchema,
  AutonomyStatusSchema,
  AutonomousMutationRequestSchema,
  CompilationPrepareRequestSchema,
  CompilationPreviewSchema,
  HistoryResponseSchema,
  TemplateConfirmRequestSchema,
  TemplatePrepareRequestSchema,
  TemplatePreviewSchema,
  TemplateVersionSchema,
  type AutonomyStatus,
  type CompilationPreview,
  type ErrorCode,
  type HistoryResponse,
  type MutationPreview,
  type MutationResult,
  type TemplatePreview,
  type TemplateVersion
} from '@second-brain/contracts';
import { VaultScopeError } from '../policy/vault-root.js';

const TOKEN_TTL_MS = 10 * 60 * 1_000;
const MAX_PENDING_PREVIEWS = 20;
const MAX_AUTONOMOUS_MUTATIONS = 60;
const AUTONOMY_DURATION_MS = 60 * 60 * 1_000;
type Clock = () => number;
type MutationFileOperations = {
  read(path: string): Promise<string | null>;
  write(path: string, content: string): Promise<void>;
  remove(path: string): Promise<void>;
  restore(path: string, content: string | null): Promise<void>;
};

const defaultFileOperations: MutationFileOperations = {
  read: readExistingFile,
  write: atomicWrite,
  remove: (path) => rm(path),
  restore: restoreFile
};

export class MutationError extends Error {
  public constructor(
    public readonly code: Extract<
      ErrorCode,
      'MUTATION_CONFLICT' | 'MUTATION_WRITE_FAILED' | 'CONFIRMATION_INVALID'
      | 'AUTONOMY_NOT_ACTIVE' | 'AUTONOMY_BUDGET_EXHAUSTED'
    >,
    message: string,
    cause?: unknown
  ) {
    super(message, { cause });
    this.name = 'MutationError';
  }
}

// Implementiert: US-000014 — kontrollierte Ein-Datei-Mutationen
export class MutationService {
  private readonly database: DatabaseSync;

  /**
   * Öffnet den lokalen Mutationsspeicher.
   * @param vaultRoot Kanonischer freigegebener Vault-Root.
   * @param databasePath Pfad zum lokalen abgeleiteten SQLite-Speicher.
   * @param clock Injizierbare Zeitquelle für Ablaufregressionen.
   * @param fileOperations Injizierbare atomare Dateioperationen für Fehlerregressionen.
   * @throws SQLite-Fehler bei nicht lesbarem Speicher.
   * @sideEffect Öffnet und migriert lokale Audit-Tabellen.
   */
  public constructor(
    private readonly vaultRoot: string,
    databasePath: string,
    private readonly clock: Clock = Date.now,
    private readonly fileOperations: MutationFileOperations = defaultFileOperations
  ) {
    this.database = new DatabaseSync(databasePath);
    this.migrate();
    this.prunePreviews(MAX_PENDING_PREVIEWS);
  }

  /** @returns Nichts. @throws SQLite-Fehler. @sideEffect Schließt den Audit-Speicher. */
  public close(): void {
    this.database.close();
  }

  /** Activates one explicitly reviewed automatic mutation policy for at most one hour. */
  public activateAutonomy(input: unknown): AutonomyStatus {
    const request = AutonomyActivationRequestSchema.parse(input);
    const now = this.clock();
    const activatedAt = new Date(now).toISOString();
    const expiresAt = new Date(now + AUTONOMY_DURATION_MS).toISOString();
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const current = this.database.prepare('SELECT * FROM autonomy_policy LIMIT 1').get();
      if (!current || Date.parse(String(current['expires_at'])) <= now) {
        this.database.prepare('DELETE FROM autonomy_policy').run();
        this.database.prepare(`
          INSERT INTO autonomy_policy(mode, activated_at, expires_at, used_mutations, paused_at)
          VALUES (?, ?, ?, 0, NULL)
        `).run(request.mode, activatedAt, expiresAt);
      } else if (Number(current['used_mutations']) < MAX_AUTONOMOUS_MUTATIONS) {
        // A reviewed reactivation may resume a pause, but never creates a fresh budget window.
        this.database.prepare('UPDATE autonomy_policy SET mode = ?, paused_at = NULL').run(request.mode);
      }
      this.database.exec('COMMIT');
    } catch (error: unknown) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    return this.autonomyStatus();
  }

  /** Returns the server-owned policy state; client supplied mode or budget is never trusted. */
  public autonomyStatus(): AutonomyStatus {
    const row = this.database.prepare('SELECT * FROM autonomy_policy LIMIT 1').get();
    if (!row) return AutonomyStatusSchema.parse({ mode: 'human-in', active: false, paused: false, usedMutations: 0, remainingMutations: 60, activatedAt: null, expiresAt: null, message: 'Human-in-the-loop is active. Each change needs confirmation.' });
    const used = Number(row['used_mutations']);
    const expiresAt = String(row['expires_at']);
    const paused = row['paused_at'] !== null;
    const expired = Date.parse(expiresAt) <= this.clock();
    const exhausted = used >= MAX_AUTONOMOUS_MUTATIONS;
    const active = !paused && !expired && !exhausted;
    return AutonomyStatusSchema.parse({
      mode: String(row['mode']), active, paused: paused || expired || exhausted, usedMutations: used,
      remainingMutations: Math.max(0, MAX_AUTONOMOUS_MUTATIONS - used),
      activatedAt: String(row['activated_at']), expiresAt,
      message: active ? `${MAX_AUTONOMOUS_MUTATIONS - used} automatic mutations remain until ${expiresAt}.` : paused ? 'Automation is paused. Each change needs confirmation.' : expired ? 'Automation expired after one hour. Each change needs confirmation.' : 'Automation paused because the mutation budget is exhausted.'
    });
  }

  /** Blocks new automatic claims; a write that already started may finish and be audited. */
  public pauseAutonomy(): AutonomyStatus {
    this.database.prepare('UPDATE autonomy_policy SET paused_at = ? WHERE paused_at IS NULL').run(new Date(this.clock()).toISOString());
    return this.autonomyStatus();
  }

  /** Claims one server-side budget slot, then executes only the existing Markdown create/update path. */
  public async executeAutonomous(input: unknown): Promise<MutationResult> {
    const request = AutonomousMutationRequestSchema.parse(input);
    const claimedAt = new Date(this.clock()).toISOString();
    let activationId: string;
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const claim = this.database.prepare(`
        UPDATE autonomy_policy SET used_mutations = used_mutations + 1
        WHERE paused_at IS NULL AND expires_at > ? AND used_mutations < ?
      `).run(claimedAt, MAX_AUTONOMOUS_MUTATIONS);
      if (claim.changes !== 1) {
        this.database.exec('ROLLBACK');
        const status = this.autonomyStatus();
        throw new MutationError(status.usedMutations >= MAX_AUTONOMOUS_MUTATIONS ? 'AUTONOMY_BUDGET_EXHAUSTED' : 'AUTONOMY_NOT_ACTIVE', status.message);
      }
      const row = this.database.prepare('SELECT activated_at FROM autonomy_policy LIMIT 1').get();
      activationId = String(row?.['activated_at']);
      this.database.exec('COMMIT');
    } catch (error: unknown) {
      try { this.database.exec('ROLLBACK'); } catch { /* Transaction was already closed. */ }
      throw error;
    }
    try {
      return await this.commitAutomatic(request.relativePath, request.content, activationId);
    } catch (error: unknown) {
      this.database.prepare(`
        UPDATE autonomy_policy SET used_mutations = MAX(used_mutations - 1, 0)
        WHERE activated_at = ?
      `).run(activationId);
      throw error;
    }
  }

  /**
   * Bereitet eine read-only Änderungsvorschau vor.
   * @param relativePath Relativer Markdown-Pfad im Vault.
   * @param content Vollständiger vorgeschlagener Zielinhalt.
   * @returns Gebundene, zeitlich begrenzte Vorschau.
   * @throws VaultScopeError oder MutationError bei ungültigem Scope beziehungsweise No-op.
   * @sideEffect Persistiert ausschließlich ein Bestätigungstoken im lokalen Index.
   */
  public async prepare(relativePath: string, content: string): Promise<MutationPreview> {
    const target = await this.resolveMarkdownTarget(relativePath);
    const before = await this.readExisting(target.absolutePath);
    if (before === content) {
      throw new MutationError('MUTATION_CONFLICT', 'The proposed content is unchanged.');
    }
    return this.storePreview({
      action: before === null ? 'create' : 'update',
      relativePath: target.relativePath,
      before,
      after: content,
      sourceAuditId: null
    });
  }

  public async prepareCompilation(input: unknown): Promise<CompilationPreview> {
    const request = CompilationPrepareRequestSchema.parse(input);
    const template = this.readTemplate(request.templateId, request.templateVersion, request.templateHash);
    const sources = await Promise.all(request.sources.map(async (source) => {
      const target = await this.resolveMarkdownTarget(source.relativePath);
      const content = await this.readExisting(target.absolutePath);
      if (content === null) throw new MutationError('MUTATION_CONFLICT', `Source ${target.relativePath} no longer exists.`);
      const hash = hashOf(content);
      if (source.expectedHash !== undefined && source.expectedHash !== hash) {
        throw new MutationError('MUTATION_CONFLICT', `Source ${target.relativePath} changed before preview.`);
      }
      return { relativePath: target.relativePath, hash, content };
    }));
    const preview = await this.prepare(request.targetPath, request.content);
    const warnings: Array<'untrusted-instruction-like-content' | 'potentially-contradictory-sources'> = [];
    if (sources.some((source) => /ignore (previous|all) instructions|system prompt|tool call|run command/iu.test(source.content))) warnings.push('untrusted-instruction-like-content');
    if (sources.some((source) => /\bcontradict(?:s|ory|ion)?\b/iu.test(source.content))) warnings.push('potentially-contradictory-sources');
    this.database.prepare(`INSERT INTO compilation_bindings(token, sources_json, template_id, template_version, template_hash, warnings_json) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(preview.token, JSON.stringify(sources.map(({ relativePath, hash }) => ({ relativePath, hash }))), template.id, template.version, template.hash, JSON.stringify(warnings));
    return CompilationPreviewSchema.parse({ ...preview, sources: sources.map(({ relativePath, hash }) => ({ relativePath, hash })), template: { id: template.id, name: template.name, version: template.version, hash: template.hash }, warnings });
  }

  public prepareTemplate(input: unknown): TemplatePreview {
    const request = TemplatePrepareRequestSchema.parse(input);
    const version = Number(this.database.prepare('SELECT COALESCE(MAX(version), 0) AS version FROM template_versions WHERE name = ?').get(request.name)?.['version'] ?? 0) + 1;
    const preview = { id: randomUUID(), name: request.name, version, content: request.content, hash: hashOf(request.content), createdAt: new Date(this.clock()).toISOString() };
    const token = randomUUID();
    this.database.prepare(`INSERT INTO template_previews(token, template_id, name, version, content, hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(token, preview.id, preview.name, preview.version, preview.content, preview.hash, preview.createdAt, new Date(this.clock() + TOKEN_TTL_MS).toISOString());
    return TemplatePreviewSchema.parse({ ...preview, token, readOnly: true });
  }

  public confirmTemplate(input: unknown): TemplateVersion {
    const request = TemplateConfirmRequestSchema.parse(input);
    const now = new Date(this.clock()).toISOString();
    const row = this.database.prepare('SELECT * FROM template_previews WHERE token = ? AND used_at IS NULL AND expires_at > ?').get(request.token, now);
    if (!row) throw new MutationError('CONFIRMATION_INVALID', 'The template confirmation is missing, expired, or already used.');
    if (this.database.prepare('UPDATE template_previews SET used_at = ? WHERE token = ? AND used_at IS NULL').run(now, request.token).changes !== 1) throw new MutationError('CONFIRMATION_INVALID', 'The template confirmation was already used.');
    const template = TemplateVersionSchema.parse({ id: String(row['template_id']), name: String(row['name']), version: Number(row['version']), content: String(row['content']), hash: String(row['hash']), createdAt: String(row['created_at']) });
    this.database.prepare('INSERT INTO template_versions(id, name, version, content, hash, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(template.id, template.name, template.version, template.content, template.hash, template.createdAt);
    return template;
  }

  public history(): HistoryResponse {
    const entries = this.database.prepare('SELECT audit_id, action, relative_path, created_at, source_audit_id FROM mutation_audit ORDER BY created_at DESC').all().map((row) => ({
      auditId: String(row['audit_id']), action: String(row['action']), relativePath: String(row['relative_path']), createdAt: String(row['created_at']), status: 'success' as const,
      rollbackStatus: row['source_audit_id'] === null ? 'available' as const : 'rolled-back' as const, summary: `${String(row['action'])} ${String(row['relative_path'])}`
    }));
    return HistoryResponseSchema.parse({ entries });
  }

  /**
   * Bestätigt genau eine vorbereitete Änderung.
   * @param token UUID der angezeigten Vorschau.
   * @returns Audit-ID und bestätigte Hashes.
   * @throws MutationError bei Ablauf, Replay oder Dateikonflikt.
   * @sideEffect Schreibt atomar genau eine Vault-Datei und einen lokalen Audit-Eintrag.
   */
  public async confirm(token: string): Promise<MutationResult> {
    const preview = this.readPreview(token);
    await this.assertCompilationBinding(token);
    const claimedAt = new Date(this.clock()).toISOString();
    const claim = this.database.prepare(`
      UPDATE mutation_previews
      SET used_at = ?
      WHERE token = ? AND used_at IS NULL AND expires_at > ?
    `).run(claimedAt, token, claimedAt);
    if (claim.changes !== 1) {
      throw new MutationError(
        'CONFIRMATION_INVALID',
        'The confirmation is missing, expired, or already used.'
      );
    }
    const target = await this.resolveMarkdownTarget(preview.relativePath);
    try {
      const current = await this.readExisting(target.absolutePath);
      if (hashNullable(current) !== preview.beforeHash) {
        throw new MutationError(
          'MUTATION_CONFLICT',
          'The note changed after the preview. Create a new preview.'
        );
      }
      if (preview.afterContent === null) {
        await this.fileOperations.remove(target.absolutePath);
      } else {
        await this.fileOperations.write(target.absolutePath, preview.afterContent);
      }
    } catch (error: unknown) {
      if (error instanceof MutationError) throw error;
      throw new MutationError(
        'MUTATION_WRITE_FAILED',
        'The note could not be replaced. Your vault remains consistent. Create a new preview and try again.',
        error
      );
    }
    const auditId = randomUUID();
    const afterHash = hashNullable(preview.afterContent);
    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.prepare(`
        INSERT INTO mutation_audit(
          audit_id, action, relative_path, before_hash, after_hash,
          before_content, after_content, source_audit_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        auditId,
        preview.action,
        preview.relativePath,
        preview.beforeHash,
        afterHash,
        preview.beforeContent,
        preview.afterContent,
        preview.sourceAuditId,
        new Date(this.clock()).toISOString()
      );
      this.database.prepare('DELETE FROM mutation_previews WHERE token = ?').run(token);
      this.database.exec('COMMIT');
    } catch (error: unknown) {
      this.database.exec('ROLLBACK');
      await this.fileOperations.restore(target.absolutePath, preview.beforeContent);
      throw error;
    }
    return MutationResultSchema.parse({
      auditId,
      action: preview.action,
      relativePath: preview.relativePath,
      beforeHash: preview.beforeHash,
      afterHash,
      changed: true
    });
  }

  /**
   * Bereitet die Umkehr einer früheren Mutation vor.
   * @param auditId Audit-ID der rückzusetzenden Mutation.
   * @returns Read-only Rollback-Vorschau.
   * @throws MutationError bei unbekanntem Audit oder neuerer Dateiänderung.
   * @sideEffect Persistiert ausschließlich ein Rollback-Bestätigungstoken.
   */
  public async prepareRollback(auditId: string): Promise<MutationPreview> {
    const row = this.database.prepare(
      'SELECT * FROM mutation_audit WHERE audit_id = ?'
    ).get(auditId);
    if (!row) {
      throw new MutationError('CONFIRMATION_INVALID', 'The audit entry does not exist.');
    }
    const relativePath = String(row['relative_path']);
    const target = await this.resolveMarkdownTarget(relativePath);
    const current = await this.readExisting(target.absolutePath);
    if (hashNullable(current) !== nullableString(row['after_hash'])) {
      throw new MutationError(
        'MUTATION_CONFLICT',
        'The note changed after this mutation. Rollback was blocked.'
      );
    }
    const beforeContent = nullableString(row['before_content']);
    return this.storePreview({
      action: 'rollback',
      relativePath,
      before: current,
      after: beforeContent,
      sourceAuditId: auditId
    });
  }

  private migrate(): void {
    this.database.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS mutation_previews (
        token TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        relative_path TEXT NOT NULL,
        before_hash TEXT,
        after_hash TEXT NOT NULL,
        before_content TEXT,
        after_content TEXT,
        diff TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used_at TEXT,
        source_audit_id TEXT
      );
      CREATE TABLE IF NOT EXISTS mutation_audit (
        audit_id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        relative_path TEXT NOT NULL,
        before_hash TEXT,
        after_hash TEXT,
        before_content TEXT,
        after_content TEXT,
        source_audit_id TEXT,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS autonomy_policy (
        mode TEXT NOT NULL CHECK(mode IN ('human-on', 'human-out')),
        activated_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used_mutations INTEGER NOT NULL CHECK(used_mutations >= 0 AND used_mutations <= 60),
        in_flight INTEGER NOT NULL DEFAULT 0 CHECK(in_flight >= 0),
        paused_at TEXT
      );
      CREATE TABLE IF NOT EXISTS template_versions (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, version INTEGER NOT NULL, content TEXT NOT NULL,
        hash TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(name, version)
      );
      CREATE TABLE IF NOT EXISTS template_previews (
        token TEXT PRIMARY KEY, template_id TEXT NOT NULL, name TEXT NOT NULL, version INTEGER NOT NULL,
        content TEXT NOT NULL, hash TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL, used_at TEXT
      );
      CREATE TABLE IF NOT EXISTS compilation_bindings (
        token TEXT PRIMARY KEY, sources_json TEXT NOT NULL, template_id TEXT NOT NULL,
        template_version INTEGER NOT NULL, template_hash TEXT NOT NULL, warnings_json TEXT NOT NULL
      );
      INSERT OR IGNORE INTO schema_migrations(version, applied_at)
      VALUES (5, datetime('now'));
    `);
    const columns = this.database.prepare('PRAGMA table_info(autonomy_policy)').all();
    if (!columns.some((column) => column['name'] === 'in_flight')) {
      this.database.exec('ALTER TABLE autonomy_policy ADD COLUMN in_flight INTEGER NOT NULL DEFAULT 0');
    }
  }

  /** Runs an automatic create/update through the same scope, hash, file and audit safeguards. */
  private async commitAutomatic(
    relativePath: string,
    content: string,
    activationId: string
  ): Promise<MutationResult> {
    const target = await this.resolveMarkdownTarget(relativePath);
    const before = await this.readExisting(target.absolutePath);
    if (before === content) throw new MutationError('MUTATION_CONFLICT', 'The proposed content is unchanged.');
    const preview = { action: before === null ? 'create' as const : 'update' as const, relativePath: target.relativePath, beforeHash: hashNullable(before), beforeContent: before, afterContent: content, sourceAuditId: null };
    try {
      if (hashNullable(await this.readExisting(target.absolutePath)) !== preview.beforeHash) {
        throw new MutationError('MUTATION_CONFLICT', 'The note changed before the automatic mutation. Nothing was written.');
      }
      const allowed = this.database.prepare(`
        SELECT 1 FROM autonomy_policy
        WHERE activated_at = ? AND paused_at IS NULL AND expires_at > ?
          AND used_mutations <= ?
      `).get(activationId, new Date(this.clock()).toISOString(), MAX_AUTONOMOUS_MUTATIONS);
      if (!allowed) {
        throw new MutationError('AUTONOMY_NOT_ACTIVE', 'Automation was paused or expired before this change could be written.');
      }
      // A claimed write predates a later pause; new claims are already blocked by paused_at.
      await this.fileOperations.write(target.absolutePath, content);
    } catch (error: unknown) {
      if (error instanceof MutationError) throw error;
      throw new MutationError('MUTATION_WRITE_FAILED', 'The note could not be replaced. Your vault remains consistent.', error);
    }
    const auditId = randomUUID();
    const afterHash = hashOf(content);
    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.prepare(`INSERT INTO mutation_audit(audit_id, action, relative_path, before_hash, after_hash, before_content, after_content, source_audit_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(auditId, preview.action, preview.relativePath, preview.beforeHash, afterHash, preview.beforeContent, preview.afterContent, null, new Date(this.clock()).toISOString());
      this.database.exec('COMMIT');
    } catch (error: unknown) {
      this.database.exec('ROLLBACK');
      await this.fileOperations.restore(target.absolutePath, before);
      throw error;
    }
    return MutationResultSchema.parse({ auditId, action: preview.action, relativePath: preview.relativePath, beforeHash: preview.beforeHash, afterHash, changed: true });
  }

  private storePreview(input: {
    action: 'create' | 'update' | 'rollback';
    relativePath: string;
    before: string | null;
    after: string | null;
    sourceAuditId: string | null;
  }): MutationPreview {
    this.prunePreviews(MAX_PENDING_PREVIEWS - 1);
    const token = randomUUID();
    const expiresAt = new Date(this.clock() + TOKEN_TTL_MS).toISOString();
    const afterHash = hashNullable(input.after) ?? hashOf('');
    const diff = createTextDiff(input.before ?? '', input.after ?? '');
    this.database.prepare(`
      INSERT INTO mutation_previews(
        token, action, relative_path, before_hash, after_hash,
        before_content, after_content, diff, expires_at, source_audit_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      token,
      input.action,
      input.relativePath,
      hashNullable(input.before),
      afterHash,
      input.before,
      input.after,
      diff,
      expiresAt,
      input.sourceAuditId
    );
    return MutationPreviewSchema.parse({
      token,
      action: input.action,
      relativePath: input.relativePath,
      beforeHash: hashNullable(input.before),
      afterHash,
      diff,
      expiresAt,
      readOnly: true
    });
  }

  /**
   * Entfernt nicht mehr bestätigbare Payloads und begrenzt offene Vorschauen.
   * @param maximumRows Maximale Zahl verbleibender Zeilen vor dem nächsten Insert.
   * @returns Nichts.
   * @throws SQLite-Fehler.
   * @sideEffect Löscht nur kurzlebige Preview-Daten; Auditdaten bleiben erhalten.
   */
  private prunePreviews(maximumRows: number): void {
    const now = new Date(this.clock()).toISOString();
    this.database.prepare(
      'DELETE FROM mutation_previews WHERE expires_at <= ? OR used_at IS NOT NULL'
    ).run(now);
    const row = this.database.prepare(
      'SELECT COUNT(*) AS total FROM mutation_previews'
    ).get();
    const excess = Number(row?.['total'] ?? 0) - maximumRows;
    if (excess <= 0) return;
    this.database.prepare(`
      DELETE FROM mutation_previews
      WHERE token IN (
        SELECT token FROM mutation_previews
        ORDER BY expires_at ASC, rowid ASC
        LIMIT ?
      )
    `).run(excess);
  }

  private readPreview(token: string): {
    action: 'create' | 'update' | 'rollback';
    relativePath: string;
    beforeHash: string | null;
    beforeContent: string | null;
    afterContent: string | null;
    sourceAuditId: string | null;
  } {
    const row = this.database.prepare(
      'SELECT * FROM mutation_previews WHERE token = ?'
    ).get(token);
    if (!row || row['used_at'] !== null || Date.parse(String(row['expires_at'])) <= this.clock()) {
      throw new MutationError(
        'CONFIRMATION_INVALID',
        'The confirmation is missing, expired, or already used.'
      );
    }
    return {
      action: String(row['action']) as 'create' | 'update' | 'rollback',
      relativePath: String(row['relative_path']),
      beforeHash: nullableString(row['before_hash']),
      beforeContent: nullableString(row['before_content']),
      afterContent: nullableString(row['after_content']),
      sourceAuditId: nullableString(row['source_audit_id'])
    };
  }

  private readTemplate(id: string, version: number, hash: string): TemplateVersion {
    const row = this.database.prepare('SELECT * FROM template_versions WHERE id = ? AND version = ? AND hash = ?').get(id, version, hash);
    if (!row) throw new MutationError('MUTATION_CONFLICT', 'The selected template is missing or changed. Create a new preview.');
    return TemplateVersionSchema.parse({ id: String(row['id']), name: String(row['name']), version: Number(row['version']), content: String(row['content']), hash: String(row['hash']), createdAt: String(row['created_at']) });
  }

  private async assertCompilationBinding(token: string): Promise<void> {
    const binding = this.database.prepare('SELECT * FROM compilation_bindings WHERE token = ?').get(token);
    if (!binding) return;
    const sources = JSON.parse(String(binding['sources_json'])) as Array<{ relativePath: string; hash: string }>;
    for (const source of sources) {
      const target = await this.resolveMarkdownTarget(source.relativePath);
      const content = await this.readExisting(target.absolutePath);
      if (content === null || hashOf(content) !== source.hash) throw new MutationError('MUTATION_CONFLICT', `Source ${source.relativePath} changed after preview.`);
    }
    this.readTemplate(String(binding['template_id']), Number(binding['template_version']), String(binding['template_hash']));
  }

  private async resolveMarkdownTarget(requestedPath: string): Promise<{
    absolutePath: string;
    relativePath: string;
  }> {
    if (isAbsolute(requestedPath) || extname(requestedPath).toLowerCase() !== '.md') {
      throw new VaultScopeError(
        'PATH_OUTSIDE_VAULT',
        'Only relative Markdown paths inside the approved vault can be changed.'
      );
    }
    const absolutePath = resolve(this.vaultRoot, requestedPath);
    const relation = relative(this.vaultRoot, absolutePath);
    if (
      !relation || relation === '..' || relation.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) ||
      relation.split(/[\\/]/u).some((part) => part === '.obsidian' || part === '.second-brain')
    ) {
      throw new VaultScopeError(
        'PATH_OUTSIDE_VAULT',
        'Only relative Markdown paths inside the approved vault can be changed.'
      );
    }
    const canonicalParent = await realpath(dirname(absolutePath));
    const parentRelation = relative(this.vaultRoot, canonicalParent);
    if (parentRelation === '..' || parentRelation.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)) {
      throw new VaultScopeError('PATH_OUTSIDE_VAULT', 'This path leaves the approved vault.');
    }
    try {
      const targetStat = await lstat(absolutePath);
      if (!targetStat.isFile() || targetStat.isSymbolicLink()) {
        throw new VaultScopeError('PATH_OUTSIDE_VAULT', 'Symlink and non-file targets are blocked.');
      }
    } catch (error: unknown) {
      if (error instanceof VaultScopeError) throw error;
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    return { absolutePath, relativePath: relation.replaceAll('\\', '/') };
  }

  private async readExisting(path: string): Promise<string | null> {
    return this.fileOperations.read(path);
  }

}

async function readExistingFile(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

function hashOf(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

function hashNullable(content: string | null): string | null {
  return content === null ? null : hashOf(content);
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function createTextDiff(before: string, after: string): string {
  const beforeLines = before.split(/\r?\n/u);
  const afterLines = after.split(/\r?\n/u);
  return [
    ...beforeLines.map((line) => `- ${line}`),
    ...afterLines.map((line) => `+ ${line}`)
  ].join('\n');
}

async function atomicWrite(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.second-brain-${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, content, { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, path);
  } catch (error: unknown) {
    await rm(temporary, { force: true });
    throw error;
  }
}

async function restoreFile(path: string, content: string | null): Promise<void> {
  if (content === null) {
    await rm(path, { force: true });
  } else {
    await atomicWrite(path, content);
  }
}
