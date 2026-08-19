// Beschreibung: Prüft Contract-3-Inbox, plugin-only Decisions, Restart, Drift und Recovery.
// Artefakte:    US-000017; US-000008; ADR-000007
// Agent:        BE — 2026-08-15
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it } from 'vitest';
import { CompilationInboxService } from '../../apps/sidecar/src/compilations/compilation-inbox-service.js';
import { MutationService } from '../../apps/sidecar/src/mutations/mutation-service.js';
import { TemplateStore } from '../../apps/sidecar/src/templates/template-store.js';

const roots: string[] = [];
afterEach(async () => Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))));

async function fixture(): Promise<{ root: string; databasePath: string; service: CompilationInboxService }> {
  const root = await mkdtemp(join(tmpdir(), 'second-brain-compilation-inbox-'));
  roots.push(root);
  await mkdir(join(root, '.obsidian'));
  await mkdir(join(root, '.second-brain'));
  const databasePath = join(root, '.second-brain', 'index.sqlite');
  return { root, databasePath, service: new CompilationInboxService(root, databasePath, 'mcp:test', 'Test MCP') };
}

function hash(content: string): string { return createHash('sha256').update(content).digest('hex'); }
function request(sourceContent: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    contractVersion: '3.0.0', clientRequestId: 'request-1',
    target: { relativePath: 'Result.md', content: '# Compiled' },
    sources: [{ relativePath: 'Source.md', expectedHash: hash(sourceContent) }],
    template: null, ...overrides
  };
}

describe('CompilationInboxService', () => {
  it('persists an idempotent pending proposal without changing the vault', async () => {
    const { root, service } = await fixture();
    await writeFile(join(root, 'Source.md'), 'facts');
    const first = await service.submit(request('facts'));
    const replay = await service.submit(request('facts'));
    expect(replay).toEqual(first);
    expect(service.summary()).toMatchObject({ count: 1 });
    await expect(readFile(join(root, 'Result.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(service.submit(request('facts', { target: { relativePath: 'Result.md', content: '# Different' } })))
      .rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
    service.close();
  });

  it('rotates a plugin token and lets exactly one confirm write the reviewed note', async () => {
    const { root, service } = await fixture();
    await writeFile(join(root, 'Source.md'), 'facts');
    const submission = await service.submit(request('facts'));
    const firstDetail = await service.detail({ pendingId: submission.pendingId });
    const detail = await service.detail({ pendingId: submission.pendingId });
    await expect(service.decide({
      pendingId: submission.pendingId, revision: firstDetail.revision,
      decision: 'confirm', decisionToken: firstDetail.decisionToken
    }, 'plugin:compilation:decide')).rejects.toMatchObject({ code: 'CONFIRMATION_ALREADY_DECIDED' });
    const result = await service.decide({
      pendingId: submission.pendingId, revision: detail.revision,
      decision: 'confirm', decisionToken: detail.decisionToken
    }, 'plugin:compilation:decide');
    expect(result.state).toBe('confirmed');
    expect(typeof result.auditId).toBe('string');
    expect(await readFile(join(root, 'Result.md'), 'utf8')).toBe('# Compiled');
    expect(service.history({}).entries[0]).toMatchObject({ status: 'success', rollbackStatus: 'available' });
    await expect(service.decide({
      pendingId: submission.pendingId, revision: detail.revision,
      decision: 'confirm', decisionToken: detail.decisionToken
    }, 'plugin:compilation:decide')).rejects.toMatchObject({ code: 'CONFIRMATION_ALREADY_DECIDED' });
    service.close();
  });

  it('rejects without writing and preserves the terminal state over restart', async () => {
    const { root, databasePath, service } = await fixture();
    await writeFile(join(root, 'Source.md'), 'facts');
    const submission = await service.submit(request('facts'));
    const detail = await service.detail({ pendingId: submission.pendingId });
    const result = await service.decide({ pendingId: submission.pendingId, revision: detail.revision, decision: 'reject', decisionToken: detail.decisionToken }, 'plugin:compilation:decide');
    expect(result).toMatchObject({ state: 'rejected', auditId: null });
    service.close();
    const restarted = new CompilationInboxService(root, databasePath, 'mcp:test', 'Test MCP');
    expect(restarted.status({ pendingId: submission.pendingId })).toMatchObject({ state: 'rejected' });
    await expect(readFile(join(root, 'Result.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    restarted.close();
  });

  it('marks source drift conflicted and never overwrites the target', async () => {
    const { root, service } = await fixture();
    await writeFile(join(root, 'Source.md'), 'before');
    const submission = await service.submit(request('before'));
    await writeFile(join(root, 'Source.md'), 'after');
    await expect(service.detail({ pendingId: submission.pendingId })).rejects.toMatchObject({ code: 'COMPILATION_DRIFT' });
    expect(service.status({ pendingId: submission.pendingId })).toMatchObject({ state: 'conflicted', errorCode: 'COMPILATION_DRIFT' });
    await expect(readFile(join(root, 'Result.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    service.close();
  });

  it('recovers an interrupted APPLYING row from the actual after-hash', async () => {
    const { root, databasePath, service } = await fixture();
    await writeFile(join(root, 'Source.md'), 'facts');
    const submission = await service.submit(request('facts'));
    service.close();
    const database = new DatabaseSync(databasePath);
    database.prepare("UPDATE compilation_requests SET state = 'applying', decided_at = datetime('now') WHERE pending_id = ?").run(submission.pendingId);
    database.close();
    await writeFile(join(root, 'Result.md'), '# Compiled');
    const restarted = new CompilationInboxService(root, databasePath, 'mcp:test', 'Test MCP');
    await restarted.recoverApplying();
    expect(restarted.status({ pendingId: submission.pendingId })).toMatchObject({ state: 'confirmed' });
    restarted.close();
  });

  it('keeps APPLYING recoverable when audit finalization fails after the vault write', async () => {
    const { root, databasePath, service } = await fixture();
    const mutations = new MutationService(root, databasePath);
    mutations.close();
    await writeFile(join(root, 'Source.md'), 'facts');
    const submission = await service.submit(request('facts'));
    const detail = await service.detail({ pendingId: submission.pendingId });
    const internals = service as unknown as { finalizeConfirmed(pendingId: string): unknown };
    internals.finalizeConfirmed = () => { throw new Error('injected audit finalization failure'); };

    await expect(service.decide({
      pendingId: submission.pendingId, revision: detail.revision, decision: 'confirm', decisionToken: detail.decisionToken
    }, 'plugin:compilation:decide')).rejects.toThrow('injected audit finalization failure');
    expect(await readFile(join(root, 'Result.md'), 'utf8')).toBe('# Compiled');
    expect(service.status({ pendingId: submission.pendingId })).toMatchObject({ state: 'applying' });
    service.close();

    const restarted = new CompilationInboxService(root, databasePath, 'mcp:test', 'Test MCP');
    await restarted.recoverApplying();
    expect(restarted.status({ pendingId: submission.pendingId })).toMatchObject({ state: 'confirmed' });
    expect(restarted.history({}).entries.find((entry) => entry.operationId === submission.pendingId))
      .toMatchObject({ status: 'success', rollbackStatus: 'available' });
    const database = new DatabaseSync(databasePath);
    expect(database.prepare('SELECT COUNT(*) AS count FROM mutation_audit').get()).toEqual({ count: 1 });
    database.close();
    restarted.close();
  });

  it('conflicts a pending proposal when its bound template file changes', async () => {
    const { root, databasePath, service } = await fixture();
    await writeFile(join(root, 'Source.md'), 'facts');
    const templates = new TemplateStore(root, databasePath);
    const template = await templates.write({ name: 'Sprint review', content: '# template', expectedLatestVersion: 0 });
    const submission = await service.submit(request('facts', {
      template: { id: template.id, version: template.version, hash: template.hash }
    }));
    await writeFile(join(root, '.second-brain', 'templates', template.id, `v${String(template.version).padStart(6, '0')}-${template.hash}.md`), '# changed');

    await expect(service.detail({ pendingId: submission.pendingId })).rejects.toMatchObject({ code: 'COMPILATION_DRIFT' });
    expect(service.status({ pendingId: submission.pendingId })).toMatchObject({ state: 'conflicted', errorCode: 'COMPILATION_DRIFT' });
    await expect(readFile(join(root, 'Result.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    templates.close();
    service.close();
  });

  it('recovers an interrupted create before its first write as incomplete', async () => {
    const { root, databasePath, service } = await fixture();
    await writeFile(join(root, 'Source.md'), 'facts');
    const submission = await service.submit(request('facts'));
    service.close();
    const database = new DatabaseSync(databasePath);
    database.prepare("UPDATE compilation_requests SET state = 'applying', decided_at = datetime('now') WHERE pending_id = ?").run(submission.pendingId);
    database.close();

    const restarted = new CompilationInboxService(root, databasePath, 'mcp:test', 'Test MCP');
    await restarted.recoverApplying();

    expect(restarted.status({ pendingId: submission.pendingId })).toMatchObject({
      state: 'incomplete', errorCode: null
    });
    expect(restarted.history({}).entries.find((entry) => entry.operationId === submission.pendingId))
      .toMatchObject({ status: 'incomplete' });
    await expect(readFile(join(root, 'Result.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    restarted.close();
  });

  it('uses field-specific errors instead of INVALID_QUERY for unsafe input', async () => {
    const { service } = await fixture();
    await expect(service.submit(request('missing', { sources: [{ relativePath: '../Outside.md', expectedHash: hash('missing') }] })))
      .rejects.toMatchObject({ code: 'COMPILATION_INVALID_SOURCE' });
    await expect(service.submit(request('missing', { target: { relativePath: '../Outside.md', content: 'x' } })))
      .rejects.toMatchObject({ code: 'COMPILATION_INVALID_TARGET' });
    service.close();
  });

  it('enforces the 50-entry limit without evicting an open review', async () => {
    const { root, service } = await fixture();
    await writeFile(join(root, 'Source.md'), 'facts');
    const pendingIds: string[] = [];
    for (let index = 0; index < 50; index += 1) {
      const submitted = await service.submit(request('facts', {
        clientRequestId: `capacity-${index}`,
        target: { relativePath: `Result-${index}.md`, content: `# Result ${index}` }
      }));
      pendingIds.push(submitted.pendingId);
    }
    await expect(service.submit(request('facts', {
      clientRequestId: 'capacity-overflow', target: { relativePath: 'Overflow.md', content: '# Overflow' }
    }))).rejects.toMatchObject({ code: 'PENDING_CAPACITY_REACHED' });
    expect(service.summary().count).toBe(50);
    expect(service.status({ pendingId: pendingIds[0] })).toMatchObject({ state: 'pending' });
    service.close();
  }, 15_000);

  it('applies schema 6 idempotently and removes only orphaned legacy bindings', async () => {
    const root = await mkdtemp(join(tmpdir(), 'second-brain-schema-6-'));
    roots.push(root);
    await mkdir(join(root, '.obsidian'));
    await mkdir(join(root, '.second-brain'));
    const databasePath = join(root, '.second-brain', 'index.sqlite');
    const database = new DatabaseSync(databasePath);
    database.exec(`
      CREATE TABLE schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
      CREATE TABLE mutation_previews(token TEXT PRIMARY KEY);
      CREATE TABLE compilation_bindings(token TEXT PRIMARY KEY);
      INSERT INTO mutation_previews(token) VALUES ('live');
      INSERT INTO compilation_bindings(token) VALUES ('live'), ('orphan');
    `);
    database.close();
    const first = new CompilationInboxService(root, databasePath, 'mcp:test', 'Test MCP');
    first.close();
    const second = new CompilationInboxService(root, databasePath, 'mcp:test', 'Test MCP');
    second.close();
    const verified = new DatabaseSync(databasePath);
    expect(verified.prepare('SELECT COUNT(*) AS count FROM schema_migrations WHERE version = 6').get()?.['count']).toBe(1);
    expect(verified.prepare('SELECT token FROM compilation_bindings ORDER BY token').all()).toEqual([{ token: 'live' }]);
    verified.close();
  });

  it('migrates the hashed schema-5 production fixture without losing legacy data', async () => {
    const root = await mkdtemp(join(tmpdir(), 'second-brain-schema-5-production-'));
    roots.push(root);
    await mkdir(join(root, '.obsidian'));
    await mkdir(join(root, '.second-brain'));
    const fixtureDirectory = join(process.cwd(), 'tests', 'fixtures', 'schema-5');
    const fixturePath = join(fixtureDirectory, 'schema-5-production.sql');
    const manifest = JSON.parse(await readFile(join(fixtureDirectory, 'manifest.json'), 'utf8')) as {
      fixtureSha256: string;
      schemaMigrations: number[];
      mutationPreviewTokens: string[];
      compilationBindingTokensAfterMigration: string[];
      auditRows: number;
      templateVersionRows: number;
    };
    const fixtureSql = await readFile(fixturePath, 'utf8');
    expect(hash(fixtureSql)).toBe(manifest.fixtureSha256);

    const databasePath = join(root, '.second-brain', 'index.sqlite');
    const database = new DatabaseSync(databasePath);
    database.exec(fixtureSql);
    database.close();

    const first = new CompilationInboxService(root, databasePath, 'mcp:test', 'Test MCP');
    first.close();
    const second = new CompilationInboxService(root, databasePath, 'mcp:test', 'Test MCP');
    second.close();

    const verified = new DatabaseSync(databasePath);
    expect(verified.prepare('SELECT version FROM schema_migrations WHERE version <= 5 ORDER BY version').all()
      .map((row) => Number(row['version']))).toEqual(manifest.schemaMigrations);
    expect(verified.prepare('SELECT COUNT(*) AS count FROM schema_migrations WHERE version = 6').get()?.['count']).toBe(1);
    expect(verified.prepare('SELECT token FROM mutation_previews ORDER BY token').all()
      .map((row) => String(row['token']))).toEqual(manifest.mutationPreviewTokens);
    expect(verified.prepare('SELECT token FROM compilation_bindings ORDER BY token').all()
      .map((row) => String(row['token']))).toEqual(manifest.compilationBindingTokensAfterMigration);
    expect(verified.prepare('SELECT COUNT(*) AS count FROM mutation_audit').get()?.['count']).toBe(manifest.auditRows);
    expect(verified.prepare('SELECT COUNT(*) AS count FROM template_versions').get()?.['count']).toBe(manifest.templateVersionRows);
    verified.close();
  });

  it('projects a rollback separately and marks its origin rolled back', async () => {
    const { root, databasePath, service } = await fixture();
    service.close();
    const mutations = new MutationService(root, databasePath);
    const original = await mutations.confirm((await mutations.prepare('Note.md', 'created')).token);
    await mutations.confirm((await mutations.prepareRollback(original.auditId)).token);
    mutations.close();
    const historyService = new CompilationInboxService(root, databasePath, 'mcp:test', 'Test MCP');
    const history = historyService.history({});
    expect(history.entries.find((entry) => entry.operationId === original.auditId)).toMatchObject({ kind: 'mutation', rollbackStatus: 'rolled-back' });
    expect(history.entries.find((entry) => entry.kind === 'rollback')).toMatchObject({ status: 'success', rollbackStatus: 'not-applicable' });
    historyService.close();
  });
});
