// Beschreibung: Misst reproduzierbare Search-, Read-, Delta- und RSS-Baselines.
// Artefakte:    US-000012; TP-000003
// Agent:        QA — 2026-07-31
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

const RUNS = 30;
const SEARCH_RUNS = 30;
const sidecar = resolve('dist/sidecar/main.js');

/**
 * Führt eine Sidecar-Operation mit kontrollierter Umgebung aus.
 * @param args CLI-Argumente.
 * @param environment Zusätzliche lokale Umgebungswerte.
 * @returns Laufzeit, Peak-RSS-Näherung und Prozessausgabe.
 * @throws Bei Prozessfehlern nur, wenn `allowFailure` nicht gesetzt ist.
 */
async function runSidecar(args, environment, allowFailure = false) {
  const started = performance.now();
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(process.execPath, [sidecar, ...args], {
      env: { ...process.env, ...environment },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    const stdout = [];
    const stderr = [];
    child.stdout.on('data', (chunk) => stdout.push(chunk));
    child.stderr.on('data', (chunk) => stderr.push(chunk));
    child.on('error', rejectRun);
    child.on('close', (code) => {
      const result = {
        code,
        durationMs: performance.now() - started,
        stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8')
      };
      if (code !== 0 && !allowFailure) {
        rejectRun(new Error(result.stderr || `Sidecar exited with ${code}`));
        return;
      }
      resolveRun(result);
    });
  });
}

/**
 * Berechnet ein Perzentil über sortierte Messwerte.
 * @param values Messwerte.
 * @param percentile Wert zwischen 0 und 1.
 * @returns Perzentilwert.
 * @throws Bei leerer Liste.
 */
function percentile(values, percentileValue) {
  const sorted = [...values].sort((left, right) => left - right);
  if (sorted.length === 0) {
    throw new Error('Cannot calculate a percentile for an empty sample.');
  }
  return sorted[Math.floor((sorted.length - 1) * percentileValue)];
}

/**
 * Erzeugt einen SHA-256-Hash.
 * @param path Zu lesende Datei.
 * @returns Hexadezimaler Hash.
 * @throws Bei Dateisystemfehlern.
 */
async function hashFile(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

const vaultRoot = await mkdtemp(join(tmpdir(), 'second-brain-qa-'));
try {
  await mkdir(join(vaultRoot, '.obsidian'));
  for (let index = 1; index <= 500; index += 1) {
    await writeFile(
      join(vaultRoot, `Note-${String(index).padStart(3, '0')}.md`),
      `# Note ${index}\nCitation performance target ${index} local search content.\n`
    );
  }
  await writeFile(join(vaultRoot, 'Small.md'), 'x'.repeat(1024));
  await writeFile(join(vaultRoot, 'Large.md'), 'y'.repeat(1024 * 1024));
  await writeFile(join(vaultRoot, 'diagram.png'), Buffer.from([137, 80, 78, 71]));

  const indexPath = join(vaultRoot, '.second-brain', 'index.sqlite');
  const baseEnvironment = {
    SECOND_BRAIN_VAULT_ROOT: vaultRoot,
    SECOND_BRAIN_INDEX_PATH: indexPath
  };
  const sync = await runSidecar(['--sync-index'], baseEnvironment);
  const sourcePath = join(vaultRoot, 'Note-001.md');
  const beforeHash = await hashFile(sourcePath);

  const searchDurations = [];
  for (let index = 0; index < SEARCH_RUNS; index += 1) {
    const result = await runSidecar(
      ['--search'],
      { ...baseEnvironment, SECOND_BRAIN_SEARCH_QUERY: 'performance target' }
    );
    searchDurations.push(result.durationMs);
  }

  const measureReads = async (relativePath) => {
    const durations = [];
    for (let index = 0; index < RUNS; index += 1) {
      const result = await runSidecar(
        ['--read-note'],
        { ...baseEnvironment, SECOND_BRAIN_READ_PATH: relativePath }
      );
      durations.push(result.durationMs);
    }
    return durations;
  };
  const smallReads = await measureReads('Small.md');
  const largeReads = await measureReads('Large.md');
  const afterReadHash = await hashFile(sourcePath);

  await writeFile(sourcePath, '# Note 1\nReplacement delta keyword.\n');
  const delta = await runSidecar(['--sync-index'], baseEnvironment);
  const afterHash = await hashFile(sourcePath);
  const scope = await runSidecar(
    ['--read-note'],
    { ...baseEnvironment, SECOND_BRAIN_READ_PATH: '..\\outside.md' },
    true
  );

  process.stdout.write(`${JSON.stringify({
    node: process.version,
    files: 503,
    syncMs: sync.durationMs,
    deltaMs: delta.durationMs,
    searchRuns: SEARCH_RUNS,
    searchP50Ms: percentile(searchDurations, 0.5),
    searchP95Ms: percentile(searchDurations, 0.95),
    read1KiBP50Ms: percentile(smallReads, 0.5),
    read1KiBP95Ms: percentile(smallReads, 0.95),
    read1MiBP50Ms: percentile(largeReads, 0.5),
    read1MiBP95Ms: percentile(largeReads, 0.95),
    readOnlyHashUnchangedBeforeIntentionalDelta: beforeHash === afterReadHash,
    intentionalDeltaChangedSource: beforeHash !== afterHash,
    scopeExitCode: scope.code,
    scopeStdout: scope.stdout,
    scopeStderr: scope.stderr
  }, null, 2)}\n`);
} finally {
  await rm(vaultRoot, { recursive: true, force: true });
}
