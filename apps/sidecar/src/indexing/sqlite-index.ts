// Beschreibung: Lokaler SQLite-Index mit Delta-Synchronisierung, FTS5 und Quellen.
// Artefakte:    US-000005; US-000012; ADR-000003
// Agent:        BE — 2026-07-31
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  SearchResponseSchema,
  type IndexStatus,
  type SearchResponse
} from '@second-brain/contracts';
import type { VaultFile } from '@second-brain/domain';

const SUPPORTED_EXTENSIONS = new Set(['.md', '.txt']);
const SKIPPED_DIRECTORIES = new Set(['.obsidian', '.second-brain']);
type ReadContent = (path: string) => Promise<Buffer>;
type VaultMetadata = Omit<VaultFile, 'fingerprint'> & {
  extractionStatus: 'extracted' | 'not_extracted';
};
type IndexedContent = VaultFile & VaultMetadata & { content: string };

// Implementiert: US-000005 — Lokale inkrementelle Indexierung
export class LocalIndex {
  private readonly database: DatabaseSync;

  /**
   * Öffnet den lokalen Index und führt die reversible Initialmigration aus.
   * @param databasePath Pfad zur abgeleiteten SQLite-Datei oder `:memory:`.
   * @throws Fehler des SQLite-Treibers.
   * @sideEffect Öffnet und migriert eine lokale SQLite-Datenbank.
   */
  public constructor(
    databasePath: string,
    private readonly readContent: ReadContent = (path) => readFile(path)
  ) {
    this.database = new DatabaseSync(databasePath);
    this.migrate();
  }

  /**
   * Erstellt die versionierte Schema-Grundlage.
   * @returns Nichts.
   * @throws Fehler des SQLite-Treibers.
   * @sideEffect Ändert ausschließlich die abgeleitete Indexdatenbank.
   */
  public migrate(): void {
    this.database.exec(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS files (
        relative_path TEXT PRIMARY KEY,
        fingerprint TEXT NOT NULL,
        modified_at INTEGER NOT NULL,
        size INTEGER NOT NULL,
        content TEXT NOT NULL,
        extraction_status TEXT NOT NULL DEFAULT 'extracted'
      );
      CREATE VIRTUAL TABLE IF NOT EXISTS files_fts USING fts5(
        relative_path UNINDEXED,
        content,
        tokenize = 'unicode61'
      );
      INSERT OR IGNORE INTO schema_migrations(version, applied_at)
      VALUES (1, datetime('now'));
      INSERT OR IGNORE INTO schema_migrations(version, applied_at)
      VALUES (2, datetime('now'));
    `);
    const columns = this.database.prepare('PRAGMA table_info(files)').all();
    if (!columns.some((column) => String(column['name']) === 'extraction_status')) {
      this.database.exec(
        "ALTER TABLE files ADD COLUMN extraction_status TEXT NOT NULL DEFAULT 'extracted'"
      );
    }
    this.database.exec(`
      INSERT INTO files_fts(relative_path, content)
      SELECT files.relative_path, files.content
      FROM files
      WHERE files.extraction_status = 'extracted'
        AND NOT EXISTS (
          SELECT 1 FROM files_fts WHERE files_fts.relative_path = files.relative_path
        );
    `);
  }

  /**
   * Scannt den Vault und persistiert nur das berechnete Delta.
   * @param vaultRoot Kanonischer und freigegebener Vault-Root.
   * @returns Indexstatus mit Delta-Zählwerten.
   * @throws Dateisystem- oder SQLite-Fehler.
   * @sideEffect Liest Vault-Dateien und schreibt ausschließlich in den Index.
   */
  public async synchronize(vaultRoot: string): Promise<IndexStatus> {
    const previous = this.readFiles();
    const metadata = await scanVaultMetadata(vaultRoot);
    const previousByPath = new Map(previous.map((file) => [file.relativePath, file]));
    const currentPaths = new Set(metadata.map((file) => file.relativePath));
    const changed: IndexedContent[] = [];
    const metadataOnly: VaultMetadata[] = [];

    for (const file of metadata) {
      const old = previousByPath.get(file.relativePath);
      if (old && old.modifiedAt === file.modifiedAt && old.size === file.size) {
        continue;
      }
      const content = file.extractionStatus === 'extracted'
        ? await this.readContent(join(vaultRoot, file.relativePath))
        : Buffer.alloc(0);
      const fingerprint = fingerprintOf(content);
      if (!old || old.fingerprint !== fingerprint) {
        changed.push({ ...file, fingerprint, content: content.toString('utf8') });
      } else {
        metadataOnly.push(file);
      }
    }
    const deleted = previous
      .filter((file) => !currentPaths.has(file.relativePath))
      .map((file) => file.relativePath);

    this.database.exec('BEGIN IMMEDIATE');
    try {
      for (const file of changed) {
        this.upsert(file);
      }
      for (const file of metadataOnly) {
        this.updateMetadata(file);
      }
      for (const deletedPath of deleted) {
        this.database.prepare('DELETE FROM files WHERE relative_path = ?').run(deletedPath);
        this.database.prepare('DELETE FROM files_fts WHERE relative_path = ?').run(deletedPath);
      }
      this.database.exec('COMMIT');
    } catch (error: unknown) {
      this.database.exec('ROLLBACK');
      throw error;
    }

    return {
      state: 'ready',
      indexedFiles: metadata.length,
      changedFiles: changed.length,
      deletedFiles: deleted.length,
      originalFilesUnchanged: true,
      message: 'Index ready. Original files unchanged.'
    };
  }

  /**
   * Baut den abgeleiteten Index neu auf, ohne Vault-Dateien zu verändern.
   * @param vaultRoot Kanonischer und freigegebener Vault-Root.
   * @returns Status des vollständigen Neuaufbaus.
   * @throws Dateisystem- oder SQLite-Fehler.
   * @sideEffect Löscht und rekonstruiert ausschließlich Indexzeilen.
   */
  public async rebuild(vaultRoot: string): Promise<IndexStatus> {
    const metadata = await scanVaultMetadata(vaultRoot);
    const snapshot: IndexedContent[] = [];
    for (const file of metadata) {
      const content = file.extractionStatus === 'extracted'
        ? await this.readContent(join(vaultRoot, file.relativePath))
        : Buffer.alloc(0);
      snapshot.push({
        ...file,
        fingerprint: fingerprintOf(content),
        content: content.toString('utf8')
      });
    }

    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.exec('DELETE FROM files');
      this.database.exec('DELETE FROM files_fts');
      for (const file of snapshot) {
        this.upsert(file);
      }
      this.database.exec('COMMIT');
    } catch (error: unknown) {
      this.database.exec('ROLLBACK');
      throw error;
    }
    return {
      state: 'ready',
      indexedFiles: snapshot.length,
      changedFiles: snapshot.length,
      deletedFiles: 0,
      originalFilesUnchanged: true,
      message: 'Index rebuilt. Original files unchanged.'
    };
  }

  /**
   * Schließt den SQLite-Handle.
   * @returns Nichts.
   * @throws Fehler des SQLite-Treibers.
   * @sideEffect Gibt den Datenbank-Handle frei.
   */
  public close(): void {
    this.database.close();
  }

  // Implementiert: US-000012 — Volltextsuche mit überprüfbaren Quellen
  /**
   * Durchsucht extrahierten Text und sichere Dateimetadaten lokal.
   * @param query Nutzerbegriff oder Phrase.
   * @param limit Maximale Trefferzahl zwischen 1 und 50.
   * @returns Validierte Treffer mit Quelle, Fundstelle und Extraktionsstatus.
   * @throws Bei leerer Anfrage oder SQLite-Fehlern.
   * @sideEffect Liest ausschließlich den lokalen abgeleiteten Index.
   */
  public search(query: string, limit = 20): SearchResponse {
    const trimmed = query.trim();
    if (!trimmed) {
      throw new Error('Search query must not be empty.');
    }
    const boundedLimit = Math.max(1, Math.min(50, limit));
    const expression = toFtsExpression(trimmed);
    const textRows = this.database.prepare(`
      SELECT f.relative_path, f.content, f.extraction_status, bm25(files_fts) AS rank
      FROM files_fts
      JOIN files f ON f.relative_path = files_fts.relative_path
      WHERE files_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `).all(expression, boundedLimit);
    const remaining = boundedLimit - textRows.length;
    const metadataRows = remaining > 0
      ? this.database.prepare(`
          SELECT relative_path, content, extraction_status, 1000.0 AS rank
          FROM files
          WHERE extraction_status = 'not_extracted'
            AND lower(relative_path) LIKE lower(?)
          ORDER BY relative_path
          LIMIT ?
        `).all(`%${escapeLike(trimmed)}%`, remaining)
      : [];
    return SearchResponseSchema.parse({
      query: trimmed,
      semanticAvailable: false,
      message: 'Semantic search is unavailable. Showing full-text results only.',
      results: [...textRows, ...metadataRows].map((row) => {
        const content = String(row['content']);
        const extractionStatus = String(row['extraction_status']);
        return {
          relativePath: String(row['relative_path']),
          line: extractionStatus === 'extracted' ? findLine(content, trimmed) : null,
          snippet: extractionStatus === 'extracted' ? createSnippet(content, trimmed) : '',
          matchType: 'full-text',
          extractionStatus,
          score: Number(row['rank'])
        };
      })
    });
  }

  private readFiles(): VaultFile[] {
    return this.database
      .prepare('SELECT relative_path, fingerprint, modified_at, size FROM files')
      .all()
      .map((row) => ({
        relativePath: String(row['relative_path']),
        fingerprint: String(row['fingerprint']),
        modifiedAt: Number(row['modified_at']),
        size: Number(row['size'])
      }));
  }

  private upsert(file: IndexedContent): void {
    this.database.prepare(`
      INSERT INTO files(
        relative_path, fingerprint, modified_at, size, content, extraction_status
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(relative_path) DO UPDATE SET
        fingerprint = excluded.fingerprint,
        modified_at = excluded.modified_at,
        size = excluded.size,
        content = excluded.content,
        extraction_status = excluded.extraction_status
    `).run(
      file.relativePath,
      file.fingerprint,
      file.modifiedAt,
      file.size,
      file.content,
      file.extractionStatus
    );
    this.database.prepare('DELETE FROM files_fts WHERE relative_path = ?').run(file.relativePath);
    if (file.extractionStatus === 'extracted') {
      this.database
        .prepare('INSERT INTO files_fts(relative_path, content) VALUES (?, ?)')
        .run(file.relativePath, file.content);
    }
  }

  private updateMetadata(file: VaultMetadata): void {
    this.database
      .prepare('UPDATE files SET modified_at = ?, size = ? WHERE relative_path = ?')
      .run(file.modifiedAt, file.size, file.relativePath);
  }
}

async function scanVaultMetadata(vaultRoot: string): Promise<VaultMetadata[]> {
  const files: VaultMetadata[] = [];
  await walk(vaultRoot, vaultRoot, files);
  return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

async function walk(root: string, directory: string, output: VaultMetadata[]): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIPPED_DIRECTORIES.has(entry.name)) {
      continue;
    }
    const absolutePath = join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      continue;
    }
    if (entry.isDirectory()) {
      await walk(root, absolutePath, output);
    } else if (entry.isFile()) {
      const metadata = await stat(absolutePath);
      const extractionStatus = SUPPORTED_EXTENSIONS.has(extname(entry.name).toLowerCase())
        ? 'extracted'
        : 'not_extracted';
      output.push({
        relativePath: relative(root, absolutePath),
        modifiedAt: Math.trunc(metadata.mtimeMs),
        size: metadata.size,
        extractionStatus
      });
    }
  }
}

function fingerprintOf(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

function toFtsExpression(query: string): string {
  const terms = query.split(/\s+/u).filter(Boolean);
  return terms.map((term) => `"${term.replaceAll('"', '""')}"`).join(' AND ');
}

function escapeLike(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_');
}

function findLine(content: string, query: string): number {
  const firstTerm = query.split(/\s+/u)[0]?.toLocaleLowerCase() ?? '';
  const offset = content.toLocaleLowerCase().indexOf(firstTerm);
  return offset < 0 ? 1 : content.slice(0, offset).split(/\r?\n/u).length;
}

function createSnippet(content: string, query: string): string {
  const normalized = content.replace(/\s+/gu, ' ').trim();
  const firstTerm = query.split(/\s+/u)[0]?.toLocaleLowerCase() ?? '';
  const offset = normalized.toLocaleLowerCase().indexOf(firstTerm);
  const start = Math.max(0, offset - 80);
  const snippet = normalized.slice(start, start + 240);
  return `${start > 0 ? '…' : ''}${snippet}${start + 240 < normalized.length ? '…' : ''}`;
}
