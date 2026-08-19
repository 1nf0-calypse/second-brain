// Beschreibung: Misst Inbox-, Maximalpayload-, Storage- und Restart-Baselines.
// Artefakte:    US-000017; TP-000009; ADR-000007
// Agent:        QA — 2026-08-16
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { DatabaseSync } from 'node:sqlite';
import {
  CompilationInboxService
} from '../../apps/sidecar/src/compilations/compilation-inbox-service.js';

type Measurement = { p50Ms: number; p95Ms: number; maximumMs: number };

function hash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function measurement(values: number[]): Measurement {
  const ordered = [...values].sort((left, right) => left - right);
  const at = (fraction: number): number =>
    ordered[Math.min(ordered.length - 1, Math.floor(ordered.length * fraction))] ?? 0;
  return {
    p50Ms: Number(at(0.5).toFixed(2)),
    p95Ms: Number(at(0.95).toFixed(2)),
    maximumMs: Number(at(1).toFixed(2))
  };
}

async function createVault(prefix: string): Promise<{ root: string; databasePath: string }> {
  const root = await mkdtemp(join(tmpdir(), prefix));
  await mkdir(join(root, '.obsidian'));
  await mkdir(join(root, '.second-brain'));
  return { root, databasePath: join(root, '.second-brain', 'index.sqlite') };
}

async function removeVault(root: string): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await rm(root, { recursive: true, force: true });
      return;
    } catch (error: unknown) {
      if ((error as { code?: unknown }).code !== 'EBUSY' || attempt === 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }
}

function request(
  clientRequestId: string,
  targetPath: string,
  content: string,
  sources: Array<{ relativePath: string; expectedHash: string }>
): Record<string, unknown> {
  return {
    contractVersion: '3.0.0',
    clientRequestId,
    target: { relativePath: targetPath, content },
    sources,
    template: null
  };
}

const roots: string[] = [];
const rssBeforeBytes = process.memoryUsage().rss;

try {
  const inbox = await createVault('second-brain-compilation-list-perf-');
  roots.push(inbox.root);
  await writeFile(join(inbox.root, 'Source.md'), 'facts');
  const source = [{ relativePath: 'Source.md', expectedHash: hash('facts') }];
  const inboxService = new CompilationInboxService(
    inbox.root,
    inbox.databasePath,
    'mcp:performance',
    'Performance MCP'
  );
  const pendingIds: string[] = [];
  for (let index = 0; index < 50; index += 1) {
    const submission = await inboxService.submit(request(
      `list-${index}`,
      `Result-${index}.md`,
      `# Result ${index}`,
      source
    ));
    pendingIds.push(submission.pendingId);
  }
  const summaries: number[] = [];
  const lists: number[] = [];
  const details: number[] = [];
  for (let index = 0; index < 30; index += 1) {
    let started = performance.now();
    inboxService.summary();
    summaries.push(performance.now() - started);
    started = performance.now();
    inboxService.list({ limit: 50 });
    lists.push(performance.now() - started);
    started = performance.now();
    await inboxService.detail({ pendingId: pendingIds[index % pendingIds.length] });
    details.push(performance.now() - started);
  }
  inboxService.close();

  const maximal = await createVault('second-brain-compilation-max-perf-');
  roots.push(maximal.root);
  const maximalSources: Array<{ relativePath: string; expectedHash: string }> = [];
  for (let index = 0; index < 20; index += 1) {
    const sourceContent = `source-${index}`;
    const relativePath = `Source-${index}.md`;
    await writeFile(join(maximal.root, relativePath), sourceContent);
    maximalSources.push({ relativePath, expectedHash: hash(sourceContent) });
  }
  const maximalService = new CompilationInboxService(
    maximal.root,
    maximal.databasePath,
    'mcp:performance',
    'Performance MCP'
  );
  const maximalStarted = performance.now();
  await maximalService.submit(request(
    'maximal',
    'Maximum.md',
    'x'.repeat(2_000_000),
    maximalSources
  ));
  const maximalDurationMs = performance.now() - maximalStarted;
  const maximalDatabaseBytes = (await stat(maximal.databasePath)).size;
  maximalService.close();

  const storage = await createVault('second-brain-compilation-storage-perf-');
  roots.push(storage.root);
  await writeFile(join(storage.root, 'Source.md'), 'facts');
  const storageService = new CompilationInboxService(
    storage.root,
    storage.databasePath,
    'mcp:performance',
    'Performance MCP'
  );
  let acceptedLargePayloads = 0;
  let storageErrorCode = 'none';
  const storageStarted = performance.now();
  for (let index = 0; index < 40; index += 1) {
    try {
      await storageService.submit(request(
        `storage-${index}`,
        `Large-${index}.md`,
        `${String(index).padStart(2, '0')}${'y'.repeat(1_999_998)}`,
        source
      ));
      acceptedLargePayloads += 1;
    } catch (error: unknown) {
      const code = (error as { code?: unknown }).code;
      storageErrorCode = typeof code === 'string' ? code : 'unknown';
      break;
    }
  }
  const storageDurationMs = performance.now() - storageStarted;
  const storageDatabaseBytes = (await stat(storage.databasePath)).size;
  storageService.close();

  const recovery = await createVault('second-brain-compilation-restart-perf-');
  roots.push(recovery.root);
  await writeFile(join(recovery.root, 'Source.md'), 'facts');
  let recoveryService = new CompilationInboxService(
    recovery.root,
    recovery.databasePath,
    'mcp:performance',
    'Performance MCP'
  );
  const recoveryIds: string[] = [];
  for (let index = 0; index < 50; index += 1) {
    recoveryIds.push((await recoveryService.submit(request(
      `restart-${index}`,
      `Restart-${index}.md`,
      `# Restart ${index}`,
      source
    ))).pendingId);
  }
  recoveryService.close();
  const recoveryId = recoveryIds[0];
  if (recoveryId === undefined) throw new Error('Recovery fixture did not create a proposal.');
  const database = new DatabaseSync(recovery.databasePath);
  database.prepare("UPDATE compilation_requests SET state = 'applying' WHERE pending_id = ?")
    .run(recoveryId);
  database.close();
  const restartDurations: number[] = [];
  const restartStates: string[] = [];
  const restartErrors: string[] = [];
  for (let index = 0; index < 5; index += 1) {
    const started = performance.now();
    recoveryService = new CompilationInboxService(
      recovery.root,
      recovery.databasePath,
      'mcp:performance',
      'Performance MCP'
    );
    try {
      await recoveryService.recoverApplying();
      restartDurations.push(performance.now() - started);
      restartStates.push(recoveryService.status({ pendingId: recoveryId }).state);
      restartErrors.push('none');
    } catch (error: unknown) {
      restartDurations.push(performance.now() - started);
      restartStates.push('error');
      const code = (error as { code?: unknown }).code;
      restartErrors.push(typeof code === 'string' ? code : 'unknown');
    } finally {
      recoveryService.close();
    }
  }

  const rssAfterBytes = process.memoryUsage().rss;
  process.stdout.write(`${JSON.stringify({
    inbox50: {
      summary: measurement(summaries),
      list: measurement(lists),
      detail: measurement(details)
    },
    maximalPayload: {
      bytes: 2_000_000,
      sources: 20,
      durationMs: Number(maximalDurationMs.toFixed(2)),
      databaseBytes: maximalDatabaseBytes
    },
    storageBudget: {
      acceptedLargePayloads,
      errorCode: storageErrorCode,
      durationMs: Number(storageDurationMs.toFixed(2)),
      databaseBytes: storageDatabaseBytes
    },
    restartRecovery: {
      runs: 5,
      durations: restartDurations.map((value) => Number(value.toFixed(2))),
      states: restartStates,
      errors: restartErrors,
      deterministic: restartStates.every((state) => state === 'incomplete')
    },
    rssBeforeBytes,
    rssAfterBytes,
    rssDeltaBytes: rssAfterBytes - rssBeforeBytes
  }, null, 2)}\n`);
} finally {
  await Promise.all(roots.map(removeVault));
}
