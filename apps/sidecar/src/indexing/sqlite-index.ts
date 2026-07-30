// Beschreibung: Lokaler, inkrementeller SQLite-Index mit sicherem Rebuild.
// Artefakte:    US-000005; ADR-000003
// Agent:        BE — 2026-07-30
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { IndexStatus } from '@second-brain/contracts';
import type { VaultFile } from '@second-brain/domain';

const SUPPORTED_EXTENSIONS = new Set(['.md', '.txt']);
type ReadContent = (path: string) => Promise<Buffer>;
type VaultMetadata = Omit<VaultFile, 'fingerprint'>;
type IndexedContent = VaultFile & { content: string };

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
        content TEXT NOT NULL
      );
      INSERT OR IGNORE INTO schema_migrations(version, applied_at)
      VALUES (1, datetime('now'));
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
      const content = await this.readContent(join(vaultRoot, file.relativePath));
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
      const content = await this.readContent(join(vaultRoot, file.relativePath));
      snapshot.push({
        ...file,
        fingerprint: fingerprintOf(content),
        content: content.toString('utf8')
      });
    }

    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.exec('DELETE FROM files');
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
      INSERT INTO files(relative_path, fingerprint, modified_at, size, content)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(relative_path) DO UPDATE SET
        fingerprint = excluded.fingerprint,
        modified_at = excluded.modified_at,
        size = excluded.size,
        content = excluded.content
    `).run(file.relativePath, file.fingerprint, file.modifiedAt, file.size, file.content);
  }

  private updateMetadata(file: VaultMetadata): void {
    this.database
      .prepare('UPDATE files SET modified_at = ?, size = ? WHERE relative_path = ?')
      .run(file.modifiedAt, file.size, file.relativePath);
  }
}

/**
 * Ermittelt Fingerprints unterstützter Textdateien rekursiv.
 * @param vaultRoot Kanonischer Vault-Root.
 * @returns Sortierte Liste aktueller Vault-Dateien.
 * @throws Dateisystemfehler bei nicht lesbaren Einträgen.
 */
export async function scanVault(vaultRoot: string): Promise<VaultFile[]> {
  const files = await scanVaultMetadata(vaultRoot);
  return Promise.all(files.map(async (file) => {
    const content = await readFile(join(vaultRoot, file.relativePath));
    return { ...file, fingerprint: fingerprintOf(content) };
  }));
}

async function scanVaultMetadata(vaultRoot: string): Promise<VaultMetadata[]> {
  const files: VaultMetadata[] = [];
  await walk(vaultRoot, vaultRoot, files);
  return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

async function walk(root: string, directory: string, output: VaultMetadata[]): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.obsidian' || entry.name === '.second-brain') {
      continue;
    }
    const absolutePath = join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      continue;
    }
    if (entry.isDirectory()) {
      await walk(root, absolutePath, output);
    } else if (entry.isFile() && SUPPORTED_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      const metadata = await stat(absolutePath);
      output.push({
        relativePath: relative(root, absolutePath),
        modifiedAt: Math.trunc(metadata.mtimeMs),
        size: metadata.size
      });
    }
  }
}

function fingerprintOf(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}
