// Beschreibung: Sidecar-Startpunkt für MCP, Index-, Lese- und bestätigte Mutationsoperationen.
// Artefakte:    US-000001; US-000007; ADR-000006; BUG-000007; BUG-000008
// Agent:        BE — 2026-08-13
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { CONTRACT_VERSION, ConsentReceiptSchema, type ConsentReceipt } from '@second-brain/contracts';
import { performSetupHandshake } from './setup-service.js';
import { startMcpServer } from '../mcp-gateway/server.js';
import { LocalIndex } from '../indexing/sqlite-index.js';
import { SearchService } from '../search/search-service.js';
import { toPublicErrorResponse } from '../errors/public-error.js';
import { MutationService } from '../mutations/mutation-service.js';
import {
  inspectProviderConnection,
  ConsentService,
  RemoteMcpProviderAdapter
} from '../providers/provider-service.js';

const vaultRoot = process.env['SECOND_BRAIN_VAULT_ROOT'];

async function loadConsentReceipts(file: string): Promise<ConsentReceipt[]> {
  try {
    return ConsentReceiptSchema.array().parse(JSON.parse(await readFile(file, 'utf8')));
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') return [];
    throw error;
  }
}

async function saveConsentReceipts(file: string, records: ConsentReceipt[]): Promise<void> {
  const temporaryFile = `${file}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(records), { encoding: 'utf8', mode: 0o600 });
  await rename(temporaryFile, file);
}

async function updateConsentReceipt(vault: string, receiptId: string): Promise<ConsentReceipt> {
  const directory = join(vault, '.second-brain');
  const file = join(directory, 'provider-consent-receipts.json');
  const records = await loadConsentReceipts(file);
  const index = records.findIndex((record) => record.receiptId === receiptId && record.revokedAt === null);
  if (index < 0) throw new Error('CONSENT_REQUIRED: No active consent receipt exists.');
  const revoked = ConsentReceiptSchema.parse({ ...records[index], revokedAt: new Date().toISOString() });
  records[index] = revoked;
  await saveConsentReceipts(file, records);
  return revoked;
}

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
    if (process.argv.includes('--provider-handshake')) {
      const provider = process.env['SECOND_BRAIN_PROVIDER'];
      if (provider !== 'chatgpt' && provider !== 'mistral') {
        throw new Error('PROVIDER_NOT_APPROVED: Select an approved provider.');
      }
      const endpoint = process.env['SECOND_BRAIN_PROVIDER_ENDPOINT'] ?? '';
      const response = await inspectProviderConnection({
        contractVersion: CONTRACT_VERSION,
        provider,
        endpoint,
        expectedScope: ['read:notes', 'consent:once']
      }, new RemoteMcpProviderAdapter());
      process.stdout.write(`${JSON.stringify(response)}\n`);
    } else if (process.argv.includes('--provider-transfer')) {
      const endpoint = process.env['SECOND_BRAIN_PROVIDER_ENDPOINT'] ?? '';
      const service = new ConsentService();
      const preview = service.prepare(JSON.parse(process.env['SECOND_BRAIN_CONSENT_REQUEST'] ?? '{}'));
      const adapter = new RemoteMcpProviderAdapter();
      const connection = await inspectProviderConnection({
        contractVersion: CONTRACT_VERSION,
        provider: preview.provider,
        endpoint,
        expectedScope: ['read:notes', 'consent:once']
      }, adapter);
      if (!connection.connected) throw new Error('PROVIDER_SCOPE_MISMATCH: The endpoint did not prove the exact restricted scopes.');
      const receipt = await service.confirm(preview.confirmationToken, adapter, endpoint);
      const directory = join(vaultRoot, '.second-brain');
      await mkdir(directory, { recursive: true });
      const file = join(directory, 'provider-consent-receipts.json');
      const records = await loadConsentReceipts(file);
      records.push(receipt);
      await saveConsentReceipts(file, records);
      process.stdout.write(`${JSON.stringify(receipt)}\n`);
    } else if (process.argv.includes('--revoke-provider-consent')) {
      process.stdout.write(`${JSON.stringify(await updateConsentReceipt(vaultRoot, process.env['SECOND_BRAIN_CONSENT_RECEIPT_ID'] ?? ''))}\n`);
    } else if (process.argv.includes('--setup-handshake')) {
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
