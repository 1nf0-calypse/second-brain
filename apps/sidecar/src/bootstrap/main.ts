// Beschreibung: Sidecar-Startpunkt für MCP, Index-, Lese- und bestätigte Mutationsoperationen.
// Artefakte:    US-000011; US-000005; US-000012; US-000013; US-000014; ADR-000001
// Agent:        BE — 2026-07-31
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { CONTRACT_VERSION } from '@second-brain/contracts';
import { performSetupHandshake } from './setup-service.js';
import { startMcpServer } from '../mcp-gateway/server.js';
import { LocalIndex } from '../indexing/sqlite-index.js';
import { SearchService } from '../search/search-service.js';
import { toPublicErrorResponse } from '../errors/public-error.js';
import { MutationService } from '../mutations/mutation-service.js';

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
      process.argv.includes('--read-note') ||
      process.argv.includes('--relationships') ||
      process.argv.includes('--node-detail') ||
      process.argv.includes('--prepare-mutation') ||
      process.argv.includes('--confirm-mutation') ||
      process.argv.includes('--prepare-rollback')
    ) {
      await mkdir(dirname(indexPath), { recursive: true });
      const index = new LocalIndex(indexPath);
      try {
        const search = new SearchService(vaultRoot, index);
        const mutations = new MutationService(vaultRoot, indexPath);
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
        } else if (process.argv.includes('--read-note')) {
          response = await search.readNote({
            relativePath: process.env['SECOND_BRAIN_READ_PATH'],
            line: process.env['SECOND_BRAIN_READ_LINE']
              ? Number(process.env['SECOND_BRAIN_READ_LINE'])
              : undefined
          });
        } else if (process.argv.includes('--relationships')) {
          response = index.relationships(
            process.env['SECOND_BRAIN_RELATIONSHIP_PATH'] ?? '',
            Number(process.env['SECOND_BRAIN_RELATIONSHIP_LIMIT'] ?? 100)
          );
        } else if (process.argv.includes('--node-detail')) {
          response = index.nodeDetail(
            process.env['SECOND_BRAIN_RELATIONSHIP_PATH'] ?? ''
          );
        } else if (process.argv.includes('--prepare-mutation')) {
          response = await mutations.prepare(
            process.env['SECOND_BRAIN_MUTATION_PATH'] ?? '',
            process.env['SECOND_BRAIN_MUTATION_CONTENT'] ?? ''
          );
        } else if (process.argv.includes('--prepare-rollback')) {
          response = await mutations.prepareRollback(
            process.env['SECOND_BRAIN_AUDIT_ID'] ?? ''
          );
        } else {
          response = await mutations.confirm(
            process.env['SECOND_BRAIN_CONFIRMATION_TOKEN'] ?? ''
          );
          await index.synchronize(vaultRoot);
        }
        process.stdout.write(`${JSON.stringify(response)}\n`);
        mutations.close();
      } finally {
        index.close();
      }
    } else {
      await mkdir(dirname(indexPath), { recursive: true });
      await startMcpServer(vaultRoot, indexPath);
    }
  } catch (error: unknown) {
    process.stderr.write(`${JSON.stringify(toPublicErrorResponse(error))}\n`);
    process.exitCode = 1;
  }
}
