// Beschreibung: Sidecar-Startpunkt für MCP, Index- und read-only Suchoperationen.
// Artefakte:    US-000011; US-000005; US-000012; ADR-000001
// Agent:        BE — 2026-07-31
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { CONTRACT_VERSION } from '@second-brain/contracts';
import { performSetupHandshake } from './setup-service.js';
import { startMcpServer } from '../mcp-gateway/server.js';
import { LocalIndex } from '../indexing/sqlite-index.js';
import { SearchService } from '../search/search-service.js';

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
    } else if (
      process.argv.includes('--sync-index') ||
      process.argv.includes('--rebuild-index') ||
      process.argv.includes('--search') ||
      process.argv.includes('--read-note')
    ) {
      await mkdir(dirname(indexPath), { recursive: true });
      const index = new LocalIndex(indexPath);
      try {
        const search = new SearchService(vaultRoot, index);
        let response: unknown;
        if (process.argv.includes('--rebuild-index')) {
          response = await index.rebuild(vaultRoot);
        } else if (process.argv.includes('--sync-index')) {
          response = await index.synchronize(vaultRoot);
        } else if (process.argv.includes('--search')) {
          response = search.search({
            query: process.env['SECOND_BRAIN_SEARCH_QUERY'],
            limit: Number(process.env['SECOND_BRAIN_SEARCH_LIMIT'] ?? 20)
          });
        } else {
          response = await search.readNote({
            relativePath: process.env['SECOND_BRAIN_READ_PATH'],
            line: process.env['SECOND_BRAIN_READ_LINE']
              ? Number(process.env['SECOND_BRAIN_READ_LINE'])
              : undefined
          });
        }
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
