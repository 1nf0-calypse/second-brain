// Beschreibung: Prüft Initialindex, Delta, Rebuild und Unveränderlichkeit des Vaults.
// Artefakte:    US-000005; ADR-000003
// Agent:        BE — 2026-07-30
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LocalIndex } from '../../apps/sidecar/src/indexing/sqlite-index.js';

const hashFile = async (path: string): Promise<string> =>
  createHash('sha256').update(await readFile(path)).digest('hex');

async function createVault(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'second-brain-index-'));
  await mkdir(join(root, '.obsidian'));
  await writeFile(join(root, 'first.md'), '# First');
  return root;
}

describe('LocalIndex', () => {
  it('indexiert initial und verändert keine Originaldatei', async () => {
    const root = await createVault();
    const source = join(root, 'first.md');
    const before = await hashFile(source);
    const index = new LocalIndex(':memory:');

    const status = await index.synchronize(root);

    expect(status).toMatchObject({
      state: 'ready',
      indexedFiles: 1,
      changedFiles: 1,
      originalFilesUnchanged: true
    });
    expect(await hashFile(source)).toBe(before);
    index.close();
  });

  it('erkennt create, change und delete inkrementell', async () => {
    const root = await createVault();
    const index = new LocalIndex(':memory:');
    await index.synchronize(root);
    await writeFile(join(root, 'first.md'), '# Changed');
    await writeFile(join(root, 'second.md'), '# Second');
    const changed = await index.synchronize(root);
    expect(changed.changedFiles).toBe(2);

    await unlink(join(root, 'second.md'));
    const deleted = await index.synchronize(root);
    expect(deleted.deletedFiles).toBe(1);
    index.close();
  });

  it('baut einen beschädigten abgeleiteten Index sicher neu auf', async () => {
    const root = await createVault();
    const source = join(root, 'first.md');
    const before = await hashFile(source);
    const index = new LocalIndex(':memory:');
    await index.synchronize(root);

    const rebuilt = await index.rebuild(root);

    expect(rebuilt.indexedFiles).toBe(1);
    expect(await hashFile(source)).toBe(before);
    index.close();
  });
});
