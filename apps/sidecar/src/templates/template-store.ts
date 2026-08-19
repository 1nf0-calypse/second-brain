// Beschreibung: Dateibasierter, unveränderlich versionierter Store für projektlokale Compilation Templates.
// Artefakte:    US-000016; ADR-000007
// Agent:        BE — 2026-08-15
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  StoredTemplateVersionSchema,
  TemplateListRequestSchema,
  TemplateListSchema,
  TemplateReadRequestSchema,
  TemplateWriteRequestSchema,
  type StoredTemplateVersion
} from '@second-brain/contracts';
import { CompilationInboxError } from '../compilations/compilation-inbox-service.js';

type Manifest = {
  id: string;
  name: string;
  latestVersion: number;
  versions: Array<{ version: number; hash: string; file: string; createdAt: string }>;
};
type Clock = () => number;

// Implementiert: US-000016 — versionierte projektlokale Kompilierungsvorlagen
export class TemplateStore {
  private readonly database: DatabaseSync;
  private readonly root: string;

  /** Opens the rebuildable registry while files remain the source of truth. */
  public constructor(vaultRoot: string, databasePath: string, private readonly clock: Clock = Date.now) {
    this.root = join(vaultRoot, '.second-brain', 'templates');
    this.database = new DatabaseSync(databasePath);
    this.migrate();
  }

  /** Closes the rebuildable registry. */
  public close(): void { this.database.close(); }

  /** Creates a template or appends one immutable version with optimistic race protection. */
  public async write(input: unknown): Promise<StoredTemplateVersion> {
    const request = TemplateWriteRequestSchema.parse(input);
    const id = request.templateId ?? randomUUID();
    const createdAt = new Date(this.clock()).toISOString();
    const hash = hashOf(request.content);
    let version = 1;
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const latest = this.database.prepare(`SELECT COALESCE(MAX(version), 0) AS version, MAX(name) AS name FROM template_registry WHERE template_id = ? AND state = 'ready'`).get(id);
      const latestVersion = Number(latest?.['version'] ?? 0);
      if (latestVersion !== request.expectedLatestVersion) {
        throw new CompilationInboxError('COMPILATION_TEMPLATE_NOT_FOUND', 'A newer template version was saved. Reload versions and review your draft again.');
      }
      if (latestVersion > 0 && String(latest?.['name']) !== request.name) {
        throw new CompilationInboxError('COMPILATION_TEMPLATE_NOT_FOUND', 'Template names cannot change between versions.');
      }
      version = latestVersion + 1;
      const file = versionFile(version, hash);
      this.database.prepare(`
        INSERT INTO template_registry(template_id, name, version, hash, file_path, created_at, state)
        VALUES (?, ?, ?, ?, ?, ?, 'reserved')
      `).run(id, request.name, version, hash, join(id, file), createdAt);
      this.database.exec('COMMIT');
    } catch (error: unknown) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    const directory = join(this.root, id);
    const file = versionFile(version, hash);
    try {
      await mkdir(directory, { recursive: true });
      await atomicFile(join(directory, file), request.content);
      const manifest = await this.readManifest(id).catch((): Manifest => ({ id, name: request.name, latestVersion: 0, versions: [] }));
      if (manifest.id !== id || manifest.name !== request.name || manifest.versions.some((entry) => entry.version === version)) {
        throw new CompilationInboxError('COMPILATION_TEMPLATE_NOT_FOUND', 'Template manifest conflicts with the reserved version.');
      }
      manifest.latestVersion = version;
      manifest.versions.push({ version, hash, file, createdAt });
      await atomicFile(join(directory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
      this.database.prepare(`UPDATE template_registry SET state = 'ready' WHERE template_id = ? AND version = ? AND hash = ?`).run(id, version, hash);
      return StoredTemplateVersionSchema.parse({ id, name: request.name, version, hash, content: request.content, createdAt });
    } catch (error: unknown) {
      this.database.prepare(`UPDATE template_registry SET state = 'orphaned' WHERE template_id = ? AND version = ?`).run(id, version);
      throw error;
    }
  }

  /** Lists stable IDs and immutable version metadata with a bounded cursor. */
  public list(input: unknown): ReturnType<typeof TemplateListSchema.parse> {
    const request = TemplateListRequestSchema.parse(input);
    const ids = this.database.prepare(`
      SELECT template_id, MIN(name) AS name, MAX(version) AS latest_version
      FROM template_registry WHERE state = 'ready' AND (? IS NULL OR template_id > ?)
      GROUP BY template_id ORDER BY template_id LIMIT ?
    `).all(request.cursor ?? null, request.cursor ?? null, request.limit + 1);
    const page = ids.slice(0, request.limit);
    return TemplateListSchema.parse({
      items: page.map((item) => ({
        id: item['template_id'], name: item['name'], latestVersion: item['latest_version'],
        versions: this.database.prepare(`SELECT version, hash, created_at FROM template_registry WHERE template_id = ? AND state = 'ready' ORDER BY version DESC`).all(String(item['template_id'])).map((version) => ({ version: version['version'], hash: version['hash'], createdAt: version['created_at'] }))
      })),
      nextCursor: ids.length > request.limit ? String(page.at(-1)?.['template_id']) : null
    });
  }

  /** Reads and hash-verifies one immutable version from the file source of truth. */
  public async read(input: unknown): Promise<StoredTemplateVersion> {
    const request = TemplateReadRequestSchema.parse(input);
    const row = this.database.prepare(`SELECT * FROM template_registry WHERE template_id = ? AND version = ? AND state = 'ready'`).get(request.id, request.version);
    if (!row) throw new CompilationInboxError('COMPILATION_TEMPLATE_NOT_FOUND', 'The template version does not exist.');
    const content = await readFile(join(this.root, String(row['file_path'])), 'utf8');
    if (hashOf(content) !== String(row['hash'])) throw new CompilationInboxError('COMPILATION_TEMPLATE_NOT_FOUND', 'The template file changed and cannot be trusted.');
    return StoredTemplateVersionSchema.parse({ id: row['template_id'], name: row['name'], version: row['version'], hash: row['hash'], content, createdAt: row['created_at'] });
  }

  /** Rebuilds the derived registry from valid manifests and immutable content files. */
  public async rebuildRegistry(): Promise<number> {
    await mkdir(this.root, { recursive: true });
    const directories = await readdir(this.root, { withFileTypes: true });
    const records: Array<{ manifest: Manifest; version: Manifest['versions'][number] }> = [];
    for (const entry of directories) {
      if (!entry.isDirectory()) continue;
      try {
        const manifest = await this.readManifest(entry.name);
        if (manifest.id !== entry.name) continue;
        for (const version of manifest.versions) {
          const content = await readFile(join(this.root, entry.name, version.file), 'utf8');
          if (hashOf(content) === version.hash && version.file === versionFile(version.version, version.hash)) records.push({ manifest, version });
        }
      } catch { /* Invalid or partial directories remain isolated and are not indexed. */ }
    }
    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.exec('DELETE FROM template_registry');
      const insert = this.database.prepare(`INSERT INTO template_registry(template_id, name, version, hash, file_path, created_at, state) VALUES (?, ?, ?, ?, ?, ?, 'ready')`);
      records.forEach(({ manifest, version }) => insert.run(manifest.id, manifest.name, version.version, version.hash, join(manifest.id, version.file), version.createdAt));
      this.database.exec('COMMIT');
    } catch (error: unknown) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    return records.length;
  }

  private migrate(): void {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS template_registry(
        template_id TEXT NOT NULL, name TEXT NOT NULL, version INTEGER NOT NULL, hash TEXT NOT NULL,
        file_path TEXT NOT NULL, created_at TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'ready',
        PRIMARY KEY(template_id, version)
      );
      INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES (6, datetime('now'));
    `);
  }

  private async readManifest(id: string): Promise<Manifest> {
    return JSON.parse(await readFile(join(this.root, id, 'manifest.json'), 'utf8')) as Manifest;
  }
}

function versionFile(version: number, hash: string): string { return `v${String(version).padStart(6, '0')}-${hash}.md`; }
function hashOf(content: string): string { return createHash('sha256').update(content, 'utf8').digest('hex'); }
async function atomicFile(path: string, content: string): Promise<void> {
  const temporary = `${path}.${randomUUID()}.tmp`;
  try { await writeFile(temporary, content, { encoding: 'utf8', flag: 'wx', mode: 0o600 }); await rename(temporary, path); }
  catch (error: unknown) { await rm(temporary, { force: true }); throw error; }
}
