// Beschreibung: Human-in-the-Loop-Vorschau, atomare Ein-Datei-Mutation, Audit und Rollback.
// Artefakte:    US-000014; ADR-000003; ADR-000004
// Agent:        BE — 2026-07-31
import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, relative, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  MutationPreviewSchema,
  MutationResultSchema,
  type ErrorCode,
  type MutationPreview,
  type MutationResult
} from '@second-brain/contracts';
import { VaultScopeError } from '../policy/vault-root.js';

const TOKEN_TTL_MS = 10 * 60 * 1_000;
const MAX_PENDING_PREVIEWS = 20;
type Clock = () => number;
type MutationFileOperations = {
  write(path: string, content: string): Promise<void>;
  remove(path: string): Promise<void>;
  restore(path: string, content: string | null): Promise<void>;
};

const defaultFileOperations: MutationFileOperations = {
  write: atomicWrite,
  remove: (path) => rm(path),
  restore: restoreFile
};

export class MutationError extends Error {
  public constructor(
    public readonly code: Extract<
      ErrorCode,
      'MUTATION_CONFLICT' | 'MUTATION_WRITE_FAILED' | 'CONFIRMATION_INVALID'
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

  /**
   * Bestätigt genau eine vorbereitete Änderung.
   * @param token UUID der angezeigten Vorschau.
   * @returns Audit-ID und bestätigte Hashes.
   * @throws MutationError bei Ablauf, Replay oder Dateikonflikt.
   * @sideEffect Schreibt atomar genau eine Vault-Datei und einen lokalen Audit-Eintrag.
   */
  public async confirm(token: string): Promise<MutationResult> {
    const preview = this.readPreview(token);
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
    const current = await this.readExisting(target.absolutePath);
    if (hashNullable(current) !== preview.beforeHash) {
      throw new MutationError(
        'MUTATION_CONFLICT',
        'The note changed after the preview. Create a new preview.'
      );
    }
    try {
      if (preview.afterContent === null) {
        await this.fileOperations.remove(target.absolutePath);
      } else {
        await this.fileOperations.write(target.absolutePath, preview.afterContent);
      }
    } catch (error: unknown) {
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
      INSERT OR IGNORE INTO schema_migrations(version, applied_at)
      VALUES (5, datetime('now'));
    `);
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
    try {
      return await readFile(path, 'utf8');
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
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
