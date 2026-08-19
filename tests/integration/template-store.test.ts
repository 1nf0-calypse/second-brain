// Beschreibung: Prüft immutable dateibasierte Template-Versionen und Registry-Rebuild.
// Artefakte:    US-000016; ADR-000007
// Agent:        BE — 2026-08-15
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it } from 'vitest';
import { TemplateStore } from '../../apps/sidecar/src/templates/template-store.js';

const roots: string[] = [];
afterEach(async () => Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))));

describe('TemplateStore', () => {
  it('creates immutable versions, detects a stale writer and rebuilds its registry', async () => {
    const root = await mkdtemp(join(tmpdir(), 'second-brain-template-store-'));
    roots.push(root);
    await mkdir(join(root, '.second-brain'));
    const databasePath = join(root, '.second-brain', 'index.sqlite');
    const store = new TemplateStore(root, databasePath);
    const first = await store.write({ name: 'Sprint Review', content: '# v1', expectedLatestVersion: 0 });
    const second = await store.write({ templateId: first.id, name: first.name, content: '# v2', expectedLatestVersion: 1 });
    expect(await store.read({ id: first.id, version: 1 })).toMatchObject({ content: '# v1', hash: first.hash });
    expect(await store.read({ id: first.id, version: 2 })).toMatchObject({ content: '# v2', hash: second.hash });
    await expect(store.write({ templateId: first.id, name: first.name, content: '# stale', expectedLatestVersion: 1 }))
      .rejects.toMatchObject({ code: 'COMPILATION_TEMPLATE_NOT_FOUND' });
    expect(store.list({}).items[0]).toMatchObject({ id: first.id, latestVersion: 2 });
    expect(await store.rebuildRegistry()).toBe(2);
    expect(store.list({}).items[0]?.versions).toHaveLength(2);
    store.close();
  });

  it('rebuilds the registry from valid vault files after lost and reserved registry states', async () => {
    const root = await mkdtemp(join(tmpdir(), 'second-brain-template-recovery-'));
    roots.push(root);
    await mkdir(join(root, '.second-brain'));
    const databasePath = join(root, '.second-brain', 'index.sqlite');
    const store = new TemplateStore(root, databasePath);
    const template = await store.write({ name: 'Recovery template', content: '# recovered', expectedLatestVersion: 0 });
    store.close();

    const database = new DatabaseSync(databasePath);
    database.exec('DELETE FROM template_registry');
    database.close();

    const recovered = new TemplateStore(root, databasePath);
    expect(await recovered.rebuildRegistry()).toBe(1);
    expect(recovered.list({}).items).toEqual([expect.objectContaining({ id: template.id, latestVersion: 1 })]);
    recovered.close();

    const reserved = new DatabaseSync(databasePath);
    reserved.exec("UPDATE template_registry SET state = 'reserved'");
    reserved.close();
    await mkdir(join(root, '.second-brain', 'templates', 'partial'), { recursive: true });
    await writeFile(join(root, '.second-brain', 'templates', 'partial', 'manifest.json'), '{invalid json');

    const restarted = new TemplateStore(root, databasePath);
    expect(await restarted.rebuildRegistry()).toBe(1);
    expect(restarted.list({}).items).toEqual([expect.objectContaining({ id: template.id, latestVersion: 1 })]);
    restarted.close();
  });
});
