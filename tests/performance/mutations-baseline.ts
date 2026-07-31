// Beschreibung: Reproduzierbare Baseline für Preview, Confirm, Rollback und Audit-Speicher.
// Artefakte:    US-000014; TP-000005; ADR-000004
// Agent:        QA — 2026-07-31
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { MutationService } from '../../apps/sidecar/src/mutations/mutation-service.js';

function percentile(values: number[], fraction: number): number {
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.min(ordered.length - 1, Math.floor(ordered.length * fraction))] ?? 0;
}

function summary(values: number[]): { p50Ms: number; p95Ms: number } {
  return {
    p50Ms: Number(percentile(values, 0.5).toFixed(2)),
    p95Ms: Number(percentile(values, 0.95).toFixed(2))
  };
}

const vaultRoot = await mkdtemp(join(tmpdir(), 'second-brain-mutation-perf-'));
await mkdir(join(vaultRoot, '.obsidian'));
await mkdir(join(vaultRoot, '.second-brain'));
const databasePath = join(vaultRoot, '.second-brain', 'index.sqlite');
const service = new MutationService(vaultRoot, databasePath);
const largeBefore = 'a'.repeat(2_000_000);
await writeFile(join(vaultRoot, 'Large.md'), largeBefore);
const rssBefore = process.memoryUsage().rss;

try {
  const previewDurations: number[] = [];
  for (let index = 0; index < 30; index += 1) {
    const started = performance.now();
    await service.prepare('Large.md', `${'b'.repeat(1_999_990)}${String(index).padStart(10, '0')}`);
    previewDurations.push(performance.now() - started);
  }
  if (await readFile(join(vaultRoot, 'Large.md'), 'utf8') !== largeBefore) {
    throw new Error('Preview changed the large source note.');
  }

  await writeFile(join(vaultRoot, 'Cycle.md'), 'cycle-0');
  const confirmDurations: number[] = [];
  const rollbackDurations: number[] = [];
  for (let index = 1; index <= 30; index += 1) {
    const next = `cycle-${index}`;
    const preview = await service.prepare('Cycle.md', next);
    let started = performance.now();
    const result = await service.confirm(preview.token);
    confirmDurations.push(performance.now() - started);
    const rollback = await service.prepareRollback(result.auditId);
    started = performance.now();
    await service.confirm(rollback.token);
    rollbackDurations.push(performance.now() - started);
    if (await readFile(join(vaultRoot, 'Cycle.md'), 'utf8') !== 'cycle-0') {
      throw new Error('Rollback did not restore the original cycle content.');
    }
  }

  const storageStarted = performance.now();
  for (let index = 0; index < 1_000; index += 1) {
    await service.prepare(`Stored-${index}.md`, `preview-${index}`);
  }
  const storageDurationMs = performance.now() - storageStarted;
  const finalPreview = await service.prepare('Storage-Confirm.md', 'confirmed');
  const finalConfirmStarted = performance.now();
  await service.confirm(finalPreview.token);
  const finalConfirmMs = performance.now() - finalConfirmStarted;
  const databaseBytes = (await stat(databasePath)).size;
  const rssAfter = process.memoryUsage().rss;

  process.stdout.write(`${JSON.stringify({
    preview2Mb: { runs: 30, ...summary(previewDurations) },
    confirm: { runs: 30, ...summary(confirmDurations) },
    rollback: { runs: 30, ...summary(rollbackDurations), restored: 30 },
    previewStorage: {
      entries: 1_000,
      durationMs: Number(storageDurationMs.toFixed(2)),
      databaseBytes,
      finalConfirmMs: Number(finalConfirmMs.toFixed(2))
    },
    rssBeforeBytes: rssBefore,
    rssAfterBytes: rssAfter,
    rssDeltaBytes: rssAfter - rssBefore
  }, null, 2)}\n`);
} finally {
  service.close();
  await rm(vaultRoot, { recursive: true, force: true });
}
