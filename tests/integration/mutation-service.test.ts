// Beschreibung: Prüft Human-in-Mutationen, Konflikte, Replay und Rollback auf echten Dateien.
// Artefakte:    US-000014; ADR-000004
// Agent:        BE — 2026-07-31
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it } from 'vitest';
import { MutationService } from '../../apps/sidecar/src/mutations/mutation-service.js';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function fixture(now = Date.now()): Promise<{
  root: string;
  service: MutationService;
  advance(milliseconds: number): void;
}> {
  const root = await mkdtemp(join(tmpdir(), 'second-brain-mutation-'));
  roots.push(root);
  await mkdir(join(root, '.obsidian'));
  await mkdir(join(root, '.second-brain'));
  let current = now;
  return {
    root,
    service: new MutationService(root, join(root, '.second-brain', 'index.sqlite'), () => current),
    advance(milliseconds: number): void {
      current += milliseconds;
    }
  };
}

describe('MutationService', () => {
  it('activates both autonomy modes only with the fixed one-hour, sixty-mutation server budget', async () => {
    const { service } = await fixture();
    expect(() => service.activateAutonomy({ mode: 'human-on', reviewed: false })).toThrow();
    expect(service.activateAutonomy({ mode: 'human-on', reviewed: true })).toMatchObject({
      mode: 'human-on', active: true, remainingMutations: 60
    });
    expect(service.activateAutonomy({ mode: 'human-out', reviewed: true })).toMatchObject({
      mode: 'human-out', active: true, remainingMutations: 60
    });
    service.close();
  });

  it('claims at most sixty automatic Markdown writes and pauses once the budget is exhausted', async () => {
    const { root, service } = await fixture();
    service.activateAutonomy({ mode: 'human-out', reviewed: true });
    await Promise.all(Array.from({ length: 60 }, (_, index) =>
      service.executeAutonomous({ relativePath: `Auto-${index}.md`, content: `# ${index}` })
    ));
    expect(service.autonomyStatus()).toMatchObject({ active: false, paused: true, usedMutations: 60, remainingMutations: 0 });
    await expect(service.executeAutonomous({ relativePath: 'Overflow.md', content: '# no' }))
      .rejects.toMatchObject({ code: 'AUTONOMY_BUDGET_EXHAUSTED' });
    expect(service.activateAutonomy({ mode: 'human-on', reviewed: true })).toMatchObject({
      active: false, paused: true, usedMutations: 60, remainingMutations: 0
    });
    await expect(service.executeAutonomous({ relativePath: 'Reset-attempt.md', content: '# no' }))
      .rejects.toMatchObject({ code: 'AUTONOMY_BUDGET_EXHAUSTED' });
    await expect(readFile(join(root, 'Overflow.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    service.close();
  });

  it('blocks automatic writes after pause or expiry without trusting a client mode', async () => {
    const clockFixture = await fixture(1_000);
    const { service } = clockFixture;
    service.activateAutonomy({ mode: 'human-on', reviewed: true });
    expect(service.pauseAutonomy()).toMatchObject({ active: false, paused: true });
    await expect(service.executeAutonomous({ relativePath: 'Paused.md', content: 'x' }))
      .rejects.toMatchObject({ code: 'AUTONOMY_NOT_ACTIVE' });
    service.activateAutonomy({ mode: 'human-out', reviewed: true });
    clockFixture.advance(60 * 60 * 1_000 + 1);
    await expect(service.executeAutonomous({ relativePath: 'Expired.md', content: 'x' }))
      .rejects.toMatchObject({ code: 'AUTONOMY_NOT_ACTIVE' });
    service.close();
  });

  it('previews without changing and atomically confirms one update', async () => {
    const { root, service } = await fixture();
    await writeFile(join(root, 'Note.md'), 'before\n');

    const preview = await service.prepare('Note.md', 'after\n');
    expect(preview).toMatchObject({ action: 'update', relativePath: 'Note.md', readOnly: true });
    expect(preview.diff).toContain('- before');
    expect(await readFile(join(root, 'Note.md'), 'utf8')).toBe('before\n');

    const result = await service.confirm(preview.token);
    expect(result).toMatchObject({ action: 'update', relativePath: 'Note.md', changed: true });
    expect(await readFile(join(root, 'Note.md'), 'utf8')).toBe('after\n');
    await expect(service.confirm(preview.token)).rejects.toMatchObject({
      code: 'CONFIRMATION_INVALID'
    });
    service.close();
  });

  it('creates a Markdown note and rolls that mutation back after a second preview', async () => {
    const { root, service } = await fixture();
    const preview = await service.prepare('Created.md', '# Created\n');
    const result = await service.confirm(preview.token);
    expect(await readFile(join(root, 'Created.md'), 'utf8')).toBe('# Created\n');

    const rollback = await service.prepareRollback(result.auditId);
    expect(rollback.action).toBe('rollback');
    await service.confirm(rollback.token);
    await expect(readFile(join(root, 'Created.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    service.close();
  });

  it('restores an updated note only while its confirmed hash is current', async () => {
    const { root, service } = await fixture();
    await writeFile(join(root, 'Note.md'), 'v1');
    const result = await service.confirm((await service.prepare('Note.md', 'v2')).token);
    const rollback = await service.prepareRollback(result.auditId);
    await service.confirm(rollback.token);
    expect(await readFile(join(root, 'Note.md'), 'utf8')).toBe('v1');

    const next = await service.confirm((await service.prepare('Note.md', 'v3')).token);
    await writeFile(join(root, 'Note.md'), 'external');
    await expect(service.prepareRollback(next.auditId)).rejects.toMatchObject({
      code: 'MUTATION_CONFLICT'
    });
    service.close();
  });

  it('blocks a confirm after the file changed since preview', async () => {
    const { root, service } = await fixture();
    await writeFile(join(root, 'Note.md'), 'before');
    const preview = await service.prepare('Note.md', 'proposed');
    await writeFile(join(root, 'Note.md'), 'external');
    await expect(service.confirm(preview.token)).rejects.toMatchObject({
      code: 'MUTATION_CONFLICT'
    });
    expect(await readFile(join(root, 'Note.md'), 'utf8')).toBe('external');
    service.close();
  });

  it('rejects expired confirmations and non-Markdown or traversal targets', async () => {
    const clockFixture = await fixture(1_000);
    const { service } = clockFixture;
    const preview = await service.prepare('Note.md', 'content');
    clockFixture.advance(11 * 60 * 1_000);
    await expect(service.confirm(preview.token)).rejects.toMatchObject({
      code: 'CONFIRMATION_INVALID'
    });
    await expect(service.prepare('../Outside.md', 'x')).rejects.toMatchObject({
      code: 'PATH_OUTSIDE_VAULT'
    });
    await expect(service.prepare('Attachment.pdf', 'x')).rejects.toMatchObject({
      code: 'PATH_OUTSIDE_VAULT'
    });
    await expect(service.prepare('.obsidian/Plugin.md', 'x')).rejects.toMatchObject({
      code: 'PATH_OUTSIDE_VAULT'
    });
    service.close();
  });

  it('rejects no-op previews and unknown rollback audit entries', async () => {
    const { root, service } = await fixture();
    await writeFile(join(root, 'Note.md'), 'same');
    await expect(service.prepare('Note.md', 'same')).rejects.toMatchObject({
      code: 'MUTATION_CONFLICT'
    });
    await expect(service.prepareRollback('11111111-1111-4111-8111-111111111111'))
      .rejects.toMatchObject({ code: 'CONFIRMATION_INVALID' });
    service.close();
  });

  it('blocks absolute, reserved, root and non-file Markdown targets', async () => {
    const { root, service } = await fixture();
    await mkdir(join(root, 'Folder.md'));
    for (const path of [
      root,
      '',
      '.second-brain/Internal.md',
      'Folder.md'
    ]) {
      await expect(service.prepare(path, 'x')).rejects.toMatchObject({
        code: 'PATH_OUTSIDE_VAULT'
      });
    }
    service.close();
  });

  it('binds a token to one winning confirmation across service instances', async () => {
    const { root, service } = await fixture();
    await writeFile(join(root, 'Note.md'), 'before');
    const preview = await service.prepare('Note.md', 'after');
    const competitor = new MutationService(root, join(root, '.second-brain', 'index.sqlite'));
    const outcomes = await Promise.allSettled([
      service.confirm(preview.token),
      competitor.confirm(preview.token)
    ]);
    expect(outcomes.filter((outcome) => outcome.status === 'fulfilled')).toHaveLength(1);
    expect(outcomes.filter((outcome) => outcome.status === 'rejected')).toHaveLength(1);
    expect(await readFile(join(root, 'Note.md'), 'utf8')).toBe('after');
    service.close();
    competitor.close();
  });

  it('blocks a target whose existing parent resolves outside the vault', async () => {
    const { root, service } = await fixture();
    const outside = await mkdtemp(join(tmpdir(), 'second-brain-outside-'));
    roots.push(outside);
    await symlink(outside, join(root, 'Linked'), 'junction');
    await expect(service.prepare('Linked/Escape.md', 'x')).rejects.toMatchObject({
      code: 'PATH_OUTSIDE_VAULT'
    });
    service.close();
  });

  it('reports a stable mutation error and preserves the original when replacement fails', async () => {
    const { root, service: fixtureService } = await fixture();
    fixtureService.close();
    await writeFile(join(root, 'Locked.md'), 'before');
    const service = new MutationService(
      root,
      join(root, '.second-brain', 'index.sqlite'),
      Date.now,
      {
        read: (path) => readFile(path, 'utf8'),
        write: () => Promise.reject(Object.assign(new Error('locked'), { code: 'EBUSY' })),
        remove: () => Promise.resolve(),
        restore: () => Promise.resolve()
      }
    );
    const preview = await service.prepare('Locked.md', 'after');

    await expect(service.confirm(preview.token)).rejects.toMatchObject({
      code: 'MUTATION_WRITE_FAILED'
    });
    expect(await readFile(join(root, 'Locked.md'), 'utf8')).toBe('before');
    service.close();
  });

  it('types an exclusive lock during the pre-write consistency read', async () => {
    const { root, service: fixtureService } = await fixture();
    fixtureService.close();
    await writeFile(join(root, 'Locked.md'), 'before');
    let reads = 0;
    const service = new MutationService(
      root,
      join(root, '.second-brain', 'index.sqlite'),
      Date.now,
      {
        read: (path) => {
          reads += 1;
          return reads === 1
            ? readFile(path, 'utf8')
            : Promise.reject(Object.assign(new Error('locked'), { code: 'EBUSY' }));
        },
        write: (path, content) => writeFile(path, content),
        remove: (path) => rm(path),
        restore: (path, content) => content === null
          ? rm(path, { force: true })
          : writeFile(path, content)
      }
    );
    const preview = await service.prepare('Locked.md', 'after');

    await expect(service.confirm(preview.token)).rejects.toMatchObject({
      code: 'MUTATION_WRITE_FAILED'
    });
    expect(await readFile(join(root, 'Locked.md'), 'utf8')).toBe('before');
    service.close();
  });

  it('restores the original update when the audit insert fails', async () => {
    const { root, service } = await fixture();
    await writeFile(join(root, 'Note.md'), 'before');
    const preview = await service.prepare('Note.md', 'after');
    const database = new DatabaseSync(join(root, '.second-brain', 'index.sqlite'));
    database.exec('DROP TABLE mutation_audit');
    database.close();

    await expect(service.confirm(preview.token)).rejects.toThrow();
    expect(await readFile(join(root, 'Note.md'), 'utf8')).toBe('before');
    service.close();
  });

  it('bounds pending previews and removes confirmed and expired payloads', async () => {
    const clockFixture = await fixture(1_000);
    const { root, service } = clockFixture;
    const tokens: string[] = [];
    for (let index = 0; index < 25; index += 1) {
      tokens.push((await service.prepare(`Pending-${index}.md`, `content-${index}`)).token);
    }
    const database = new DatabaseSync(join(root, '.second-brain', 'index.sqlite'));
    const previewCount = (): number =>
      (database.prepare('SELECT COUNT(*) AS count FROM mutation_previews').get() as { count: number }).count;
    const firstToken = tokens[0];
    const latestToken = tokens.at(-1);
    if (firstToken === undefined || latestToken === undefined) {
      throw new Error('Preview token fixture was not created.');
    }
    expect(previewCount()).toBe(20);
    await expect(service.confirm(firstToken)).rejects.toMatchObject({ code: 'CONFIRMATION_INVALID' });

    const result = await service.confirm(latestToken);
    expect(previewCount()).toBe(19);
    expect((database.prepare('SELECT COUNT(*) AS count FROM mutation_audit').get() as { count: number }).count)
      .toBe(1);

    clockFixture.advance(11 * 60 * 1_000);
    await service.prepare('Fresh.md', 'fresh');
    expect(previewCount()).toBe(1);

    const rollback = await service.prepareRollback(result.auditId);
    await service.confirm(rollback.token);
    await expect(readFile(join(root, 'Pending-24.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    database.close();
    service.close();
  });
});
