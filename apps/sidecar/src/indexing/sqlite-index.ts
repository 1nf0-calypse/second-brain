// Beschreibung: Lokaler, inkrementeller SQLite-Index mit sicherem Rebuild.
// Artefakte:    US-000005; ADR-000003
// Agent:        BE — 2026-07-30
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { IndexStatus } from '@second-brain/contracts';
import { calculateDelta, type VaultFile } from '@second-brain/domain';

const SUPPORTED_EXTENSIONS = new Set(['.md', '.txt']);

// Implementiert: US-000005 — Lokale inkrementelle Indexierung
export class LocalIndex {
  private readonly database: DatabaseSync;

  /**
   * Öffnet den lokalen Index und führt die reversible Initialmigration aus.
   * @param databasePath Pfad zur abgeleiteten SQLite-Datei oder `:memory:`.
   * @throws Fehler des SQLite-Treibers.
   * @sideEffect Öffnet und migriert eine lokale SQLite-Datenbank.
   */
  public constructor(databasePath: string) {
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
    const current = await scanVault(vaultRoot);
    const previous = this.readFiles();
    const delta = calculateDelta(previous, current);
    const upsert = this.database.prepare(`
      INSERT INTO files(relative_path, fingerprint, modified_at, size, content)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(relative_path) DO UPDATE SET
        fingerprint = excluded.fingerprint,
        modified_at = excluded.modified_at,
        size = excluded.size,
        content = excluded.content
    `);
    const remove = this.database.prepare('DELETE FROM files WHERE relative_path = ?');

    this.database.exec('BEGIN IMMEDIATE');
    try {
      for (const file of [...delta.created, ...delta.changed]) {
        const content = await readFile(join(vaultRoot, file.relativePath), 'utf8');
        upsert.run(file.relativePath, file.fingerprint, file.modifiedAt, file.size, content);
      }
      for (const deletedPath of delta.deleted) {
        remove.run(deletedPath);
      }
      this.database.exec('COMMIT');
    } catch (error: unknown) {
      this.database.exec('ROLLBACK');
      throw error;
    }

    return {
      state: 'ready',
      indexedFiles: current.length,
      changedFiles: delta.created.length + delta.changed.length,
      deletedFiles: delta.deleted.length,
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
    this.database.exec('DELETE FROM files');
    return this.synchronize(vaultRoot);
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
}

/**
 * Ermittelt Fingerprints unterstützter Textdateien rekursiv.
 * @param vaultRoot Kanonischer Vault-Root.
 * @returns Sortierte Liste aktueller Vault-Dateien.
 * @throws Dateisystemfehler bei nicht lesbaren Einträgen.
 */
export async function scanVault(vaultRoot: string): Promise<VaultFile[]> {
  const files: VaultFile[] = [];
  await walk(vaultRoot, vaultRoot, files);
  return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

async function walk(root: string, directory: string, output: VaultFile[]): Promise<void> {
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
      const [content, metadata] = await Promise.all([readFile(absolutePath), stat(absolutePath)]);
      output.push({
        relativePath: relative(root, absolutePath),
        fingerprint: createHash('sha256').update(content).digest('hex'),
        modifiedAt: Math.trunc(metadata.mtimeMs),
        size: metadata.size
      });
    }
  }
}
