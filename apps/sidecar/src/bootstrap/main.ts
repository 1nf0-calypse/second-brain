// Beschreibung: Startpunkt des lokalen Sidecars mit strikter stdout-Protokolldisziplin.
// Artefakte:    US-000011; US-000005; ADR-000001
// Agent:        BE — 2026-07-30
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { CONTRACT_VERSION } from '@second-brain/contracts';
import { performSetupHandshake } from './setup-service.js';
import { startMcpServer } from '../mcp-gateway/server.js';
import { LocalIndex } from '../indexing/sqlite-index.js';

const vaultRoot = process.env['SECOND_BRAIN_VAULT_ROOT'];

if (!vaultRoot) {
  process.stderr.write(
    `${JSON.stringify({ level: 'error', code: 'INVALID_VAULT', message: 'Vault root missing.' })}\n`
  );
  process.exitCode = 1;
} else {
  const indexPath =
    process.env['SECOND_BRAIN_INDEX_PATH'] ??
    join(vaultRoot, '.second-brain', 'index.sqlite');
  try {
    if (process.argv.includes('--setup-handshake')) {
      const response = await performSetupHandshake({
        contractVersion: process.env['SECOND_BRAIN_CONTRACT_VERSION'] ?? CONTRACT_VERSION,
        client: 'claude-desktop',
        vaultRoot
      });
      process.stdout.write(`${JSON.stringify(response)}\n`);
    } else if (process.argv.includes('--sync-index') || process.argv.includes('--rebuild-index')) {
      await mkdir(dirname(indexPath), { recursive: true });
      const index = new LocalIndex(indexPath);
      try {
        const response = process.argv.includes('--rebuild-index')
          ? await index.rebuild(vaultRoot)
          : await index.synchronize(vaultRoot);
        process.stdout.write(`${JSON.stringify(response)}\n`);
      } finally {
        index.close();
      }
    } else {
      await mkdir(dirname(indexPath), { recursive: true });
      await startMcpServer(vaultRoot, indexPath);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown sidecar error';
    process.stderr.write(
      `${JSON.stringify({ level: 'error', code: 'SIDECAR_START_FAILED', message })}\n`
    );
    process.exitCode = 1;
  }
}
