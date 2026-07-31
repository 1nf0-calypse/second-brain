// Beschreibung: Prüft Volltextsuche, Quellen, Anhänge und Vault-Scope.
// Artefakte:    US-000012; ADR-000003; ADR-000004
// Agent:        BE — 2026-07-31
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { LocalIndex } from '../../apps/sidecar/src/indexing/sqlite-index.js';
import { SearchService } from '../../apps/sidecar/src/search/search-service.js';

async function createSearchVault(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'second-brain-search-'));
  await mkdir(join(root, '.obsidian'));
  await writeFile(
    join(root, 'Alpha.md'),
    '# Alpha\nFirst line.\nThe citation target is searchable here.\n'
  );
  await writeFile(join(root, 'diagram.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  return root;
}

async function hash(path: string): Promise<string> {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

describe('SearchService', () => {
  it('lehnt eine leere Suchanfrage vor der Datenbankabfrage ab', async () => {
    const root = await createSearchVault();
    const index = new LocalIndex(':memory:');
    await index.synchronize(root);
    expect(() => index.search('   ')).toThrow('must not be empty');
    index.close();
  });

  it('liefert Volltexttreffer mit Pfad, Zeile, Auszug und Degradationshinweis', async () => {
    const root = await createSearchVault();
    const index = new LocalIndex(':memory:');
    await index.synchronize(root);
    const service = new SearchService(root, index);
    const response = service.search({ query: 'citation target', limit: 10 });

    expect(response).toMatchObject({
      semanticAvailable: false,
      message: 'Semantic search is unavailable. Showing full-text results only.'
    });
    expect(response.results[0]).toMatchObject({
      relativePath: 'Alpha.md',
      line: 3,
      matchType: 'full-text',
      extractionStatus: 'extracted'
    });
    expect(response.results[0]?.snippet).toContain('citation target');
    index.close();
  });

  it('liest eine zitierte Textnotiz ohne die Originaldatei zu verändern', async () => {
    const root = await createSearchVault();
    const source = join(root, 'Alpha.md');
    const before = await hash(source);
    const index = new LocalIndex(':memory:');
    await index.synchronize(root);
    const service = new SearchService(root, index);
    const note = await service.readNote({ relativePath: 'Alpha.md', line: 3 });

    expect(note.requestedLine).toBe(3);
    expect(note.content).toContain('citation target');
    expect(await hash(source)).toBe(before);
    index.close();
  });

  it('blockiert Traversal außerhalb des freigegebenen Vaults', async () => {
    const root = await createSearchVault();
    const index = new LocalIndex(':memory:');
    const service = new SearchService(root, index);
    await expect(service.readNote({ relativePath: '..\\outside.md' })).rejects.toThrow();
    index.close();
  });

  it('blockiert einen absoluten Fremdpfad außerhalb des Vaults', async () => {
    const root = await createSearchVault();
    const outside = await mkdtemp(join(tmpdir(), 'second-brain-outside-'));
    const outsidePath = join(outside, 'secret.md');
    await writeFile(outsidePath, 'secret');
    const index = new LocalIndex(':memory:');
    const service = new SearchService(root, index);
    await expect(service.readNote({ relativePath: outsidePath })).rejects.toThrow();
    index.close();
  });

  it('liefert nicht extrahierte Anhänge ausschließlich als Metadatentreffer', async () => {
    const root = await createSearchVault();
    const index = new LocalIndex(':memory:');
    await index.synchronize(root);
    const service = new SearchService(root, index);
    const response = service.search({ query: 'diagram', limit: 10 });

    expect(response.results).toContainEqual(
      expect.objectContaining({
        relativePath: 'diagram.png',
        line: null,
        snippet: '',
        extractionStatus: 'not_extracted'
      })
    );
    await expect(service.readNote({ relativePath: 'diagram.png' })).rejects.toThrow(
      'not extracted'
    );
    index.close();
  });

  it('synchronisiert geänderten Text und entfernt veraltete FTS-Treffer', async () => {
    const root = await createSearchVault();
    const index = new LocalIndex(':memory:');
    await index.synchronize(root);
    await writeFile(join(root, 'Alpha.md'), '# Alpha\nReplacement keyword.\n');
    await index.synchronize(root);
    const service = new SearchService(root, index);

    expect(service.search({ query: 'citation' }).results).toHaveLength(0);
    expect(service.search({ query: 'replacement' }).results[0]?.relativePath).toBe('Alpha.md');
    index.close();
  });

  it('übernimmt bestehende Sprint-1-Indexzeilen verlustfrei in FTS5', async () => {
    const root = await createSearchVault();
    const databasePath = join(root, '.second-brain-index.sqlite');
    const legacy = new DatabaseSync(databasePath);
    legacy.exec(`
      CREATE TABLE files (
        relative_path TEXT PRIMARY KEY,
        fingerprint TEXT NOT NULL,
        modified_at INTEGER NOT NULL,
        size INTEGER NOT NULL,
        content TEXT NOT NULL
      );
      INSERT INTO files VALUES ('Legacy.md', 'hash', 1, 20, 'Legacy searchable citation');
    `);
    legacy.close();

    const index = new LocalIndex(databasePath);
    expect(index.search('legacy').results[0]?.relativePath).toBe('Legacy.md');
    index.close();
  });
});
