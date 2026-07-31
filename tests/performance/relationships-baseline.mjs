// Beschreibung: Reproduzierbare Windows-Baseline für Graphabfrage, Delta und Rebuild.
// Artefakte:    US-000013; TP-000004; ADR-000003
// Agent:        QA — 2026-07-31
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

const vaultRoot = mkdtempSync(join(tmpdir(), 'second-brain-relationship-perf-'));
mkdirSync(join(vaultRoot, '.obsidian'));
for (let index = 0; index < 500; index += 1) {
  const next = (index + 1) % 500;
  writeFileSync(
    join(vaultRoot, `Note-${index}.md`),
    `---\nstatus: active\n---\n# Note ${index}\n[[Note-${next}]] #baseline\n`
  );
}
const entry = resolve('dist/sidecar/main.js');
const indexPath = join(vaultRoot, '.second-brain', 'index.sqlite');
const baseEnvironment = {
  ...process.env,
  SECOND_BRAIN_VAULT_ROOT: vaultRoot,
  SECOND_BRAIN_INDEX_PATH: indexPath
};
const run = (operation, extra = {}) => {
  const started = performance.now();
  const output = execFileSync(process.execPath, [entry, operation], {
    encoding: 'utf8',
    env: { ...baseEnvironment, ...extra },
    windowsHide: true
  });
  return { durationMs: performance.now() - started, output: JSON.parse(output) };
};

const rebuild = run('--rebuild-index');
const queryDurations = [];
const rssBefore = process.memoryUsage().rss;
for (let index = 0; index < 100; index += 1) {
  queryDurations.push(run('--relationships', {
    SECOND_BRAIN_RELATIONSHIP_PATH: `Note-${index % 500}.md`
  }).durationMs);
}
const rssAfter = process.memoryUsage().rss;
writeFileSync(join(vaultRoot, 'Note-0.md'), '# Changed\n[[Note-2]] #updated\n');
const delta = run('--sync-index');
queryDurations.sort((left, right) => left - right);
const percentile = (fraction) =>
  queryDurations[Math.min(queryDurations.length - 1, Math.floor(queryDurations.length * fraction))];

process.stdout.write(`${JSON.stringify({
  files: 500,
  rebuildMs: Number(rebuild.durationMs.toFixed(2)),
  indexedFiles: rebuild.output.indexedFiles,
  relationshipQueryRuns: queryDurations.length,
  relationshipP50Ms: Number(percentile(0.5).toFixed(2)),
  relationshipP95Ms: Number(percentile(0.95).toFixed(2)),
  deltaMs: Number(delta.durationMs.toFixed(2)),
  deltaChangedFiles: delta.output.changedFiles,
  rssBeforeBytes: rssBefore,
  rssAfterBytes: rssAfter,
  rssDeltaBytes: rssAfter - rssBefore
}, null, 2)}\n`);
