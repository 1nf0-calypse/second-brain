// Beschreibung: Prüft Kantenmigration, Backlinks, Delta und read-only Knotendetails.
// Artefakte:    US-000013; ADR-000003; ADR-000004
// Agent:        BE — 2026-07-31
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { LocalIndex } from '../../apps/sidecar/src/indexing/sqlite-index.js';

async function createRelationshipVault(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'second-brain-relationships-'));
  await mkdir(join(root, '.obsidian'));
  await writeFile(join(root, 'Source.md'), 'See [[Target]] and [[Missing]]. #topic');
  await writeFile(join(root, 'Target.md'), '# Target');
  return root;
}

async function hash(path: string): Promise<string> {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

describe('LocalIndex relationships', () => {
  it('liefert ausgehende Kanten und Backlinks mit Navigation', async () => {
    const root = await createRelationshipVault();
    const sourcePath = join(root, 'Source.md');
    const before = await hash(sourcePath);
    const index = new LocalIndex(':memory:');
    await index.synchronize(root);

    const sourceRelationships = index.relationships('Source.md').relationships;
    expect(sourceRelationships.some((relationship) =>
      relationship.type === 'wiki-link' &&
      relationship.direction === 'outgoing' &&
      relationship.target.relativePath === 'Target.md'
    )).toBe(true);
    expect(sourceRelationships.some((relationship) =>
      relationship.target.id === 'Missing.md' &&
      relationship.target.relativePath === null
    )).toBe(true);
    expect(sourceRelationships.some((relationship) =>
      relationship.type === 'tag' && relationship.direction === 'outgoing'
    )).toBe(true);
    expect(index.relationships('Target.md').relationships[0]).toMatchObject({
      type: 'wiki-link',
      direction: 'incoming',
      target: { relativePath: 'Source.md' }
    });
    expect(index.nodeDetail('Target.md')).toMatchObject({
      outgoingCount: 0,
      incomingCount: 1,
      readOnly: true
    });
    expect(await hash(sourcePath)).toBe(before);
    index.close();
  });

  it('ersetzt und entfernt Kanten atomar bei Dateiänderungen', async () => {
    const root = await createRelationshipVault();
    const index = new LocalIndex(':memory:');
    await index.synchronize(root);
    await writeFile(join(root, 'Source.md'), 'No links remain.');
    await index.synchronize(root);
    expect(index.relationships('Target.md').relationships).toHaveLength(0);

    await unlink(join(root, 'Source.md'));
    await index.synchronize(root);
    expect(index.relationships('Target.md').relationships).toHaveLength(0);
    index.close();
  });

  it('projiziert unveränderte Bestandsdateien nach der Graphmigration einmalig neu', async () => {
    const root = await createRelationshipVault();
    await mkdir(join(root, '.second-brain'));
    const databasePath = join(root, '.second-brain', 'index.sqlite');
    const initial = new LocalIndex(databasePath);
    await initial.synchronize(root);
    initial.close();
    const stale = new DatabaseSync(databasePath);
    stale.exec('DELETE FROM graph_edges; UPDATE files SET relationships_fingerprint = NULL;');
    stale.close();

    const migrated = new LocalIndex(databasePath);
    const status = await migrated.synchronize(root);

    expect(status.changedFiles).toBe(2);
    expect(migrated.relationships('Source.md').relationships.some((relationship) =>
      relationship.target.relativePath === 'Target.md'
    )).toBe(true);
    migrated.close();
  });
});
