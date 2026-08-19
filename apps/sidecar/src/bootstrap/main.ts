// Beschreibung: Sidecar-Startpunkt für MCP, Index-, Lese-, Mutations-, Inbox- und Autonomieoperationen.
// Artefakte:    US-000001; US-000003; US-000007; US-000017; US-000008; ADR-000004; ADR-000006; ADR-000007
// Agent:        BE — 2026-08-15
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { CONTRACT_VERSION, ConsentReceiptSchema, type ConsentReceipt } from '@second-brain/contracts';
import { performSetupHandshake } from './setup-service.js';
import { startMcpServer } from '../mcp-gateway/server.js';
import { LocalIndex } from '../indexing/sqlite-index.js';
import { SearchService } from '../search/search-service.js';
import { toPublicErrorResponse } from '../errors/public-error.js';
import { MutationService } from '../mutations/mutation-service.js';
import { CompilationInboxService } from '../compilations/compilation-inbox-service.js';
import { TemplateStore } from '../templates/template-store.js';
import {
  inspectProviderConnection,
  ConsentService,
  ProviderConsentStore,
  RemoteMcpProviderAdapter
} from '../providers/provider-service.js';

const vaultRoot = process.env['SECOND_BRAIN_VAULT_ROOT'];

async function readJsonStdin(): Promise<unknown> {
  process.stdin.setEncoding('utf8');
  const chunks: string[] = [];
  for await (const chunk of process.stdin) chunks.push(String(chunk));
  const text = chunks.join('').trim();
  return text.length === 0 ? {} : JSON.parse(text);
}

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
    } else if (process.argv.includes('--prepare-provider-transfer')) {
      const endpoint = process.env['SECOND_BRAIN_PROVIDER_ENDPOINT'] ?? '';
      const directory = join(vaultRoot, '.second-brain');
      await mkdir(directory, { recursive: true });
      const store = new ProviderConsentStore(join(directory, 'provider-consent.sqlite'));
      const preview = store.prepare(JSON.parse(process.env['SECOND_BRAIN_CONSENT_REQUEST'] ?? '{}'), endpoint);
      store.close();
      process.stdout.write(`${JSON.stringify(preview)}\n`);
    } else if (process.argv.includes('--confirm-provider-transfer')) {
      const directory = join(vaultRoot, '.second-brain');
      await mkdir(directory, { recursive: true });
      const store = new ProviderConsentStore(join(directory, 'provider-consent.sqlite'));
      const { request, endpoint } = store.claim(JSON.parse(process.env['SECOND_BRAIN_CONSENT_CONFIRMATION'] ?? '{}'));
      store.close();
      const service = new ConsentService();
      const preview = service.prepare(request);
      const adapter = new RemoteMcpProviderAdapter();
      const connection = await inspectProviderConnection({
        contractVersion: CONTRACT_VERSION,
        provider: preview.provider,
        endpoint,
        expectedScope: ['read:notes', 'consent:once']
      }, adapter);
      if (!connection.connected) throw new Error('PROVIDER_SCOPE_MISMATCH: The endpoint did not prove the exact restricted scopes.');
      const receipt = await service.confirm(preview.confirmationToken, adapter, endpoint);
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
      process.argv.includes('--prepare-rollback') ||
      process.argv.includes('--activate-autonomy') ||
      process.argv.includes('--autonomy-status') ||
      process.argv.includes('--pause-autonomy') ||
      process.argv.includes('--autonomous-mutation') ||
      process.argv.includes('--prepare-compilation') ||
      process.argv.includes('--prepare-template') ||
      process.argv.includes('--confirm-template') ||
      process.argv.includes('--change-history') ||
      process.argv.includes('--pending-compilation-summary') ||
      process.argv.includes('--list-pending-compilations') ||
      process.argv.includes('--get-pending-compilation') ||
      process.argv.includes('--decide-pending-compilation') ||
      process.argv.includes('--operation-history')
      || process.argv.includes('--list-templates')
      || process.argv.includes('--read-template')
      || process.argv.includes('--write-template-version')
    ) {
      await mkdir(dirname(indexPath), { recursive: true });
      const index = new LocalIndex(indexPath);
      try {
        const search = new SearchService(vaultRoot, index);
        const mutations = new MutationService(vaultRoot, indexPath);
        const compilations = new CompilationInboxService(
          vaultRoot,
          indexPath,
          'plugin:obsidian',
          'Obsidian'
        );
        const templates = new TemplateStore(vaultRoot, indexPath);
        await templates.rebuildRegistry();
        await compilations.recoverApplying();
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
        } else if (process.argv.includes('--activate-autonomy')) {
          response = mutations.activateAutonomy(JSON.parse(process.env['SECOND_BRAIN_AUTONOMY_REQUEST'] ?? '{}'));
        } else if (process.argv.includes('--autonomy-status')) {
          response = mutations.autonomyStatus();
        } else if (process.argv.includes('--pause-autonomy')) {
          response = mutations.pauseAutonomy();
        } else if (process.argv.includes('--autonomous-mutation')) {
          response = await mutations.executeAutonomous(JSON.parse(process.env['SECOND_BRAIN_AUTONOMOUS_MUTATION'] ?? '{}'));
          await index.synchronize(vaultRoot);
        } else if (process.argv.includes('--prepare-compilation')) {
          response = await mutations.prepareCompilation(JSON.parse(process.env['SECOND_BRAIN_COMPILATION_REQUEST'] ?? '{}'));
        } else if (process.argv.includes('--prepare-template')) {
          response = mutations.prepareTemplate(JSON.parse(process.env['SECOND_BRAIN_TEMPLATE_REQUEST'] ?? '{}'));
        } else if (process.argv.includes('--confirm-template')) {
          response = mutations.confirmTemplate(JSON.parse(process.env['SECOND_BRAIN_TEMPLATE_CONFIRMATION'] ?? '{}'));
        } else if (process.argv.includes('--change-history')) {
          response = mutations.history();
        } else if (process.argv.includes('--pending-compilation-summary')) {
          response = compilations.summary();
        } else if (process.argv.includes('--list-pending-compilations')) {
          response = compilations.list(await readJsonStdin());
        } else if (process.argv.includes('--get-pending-compilation')) {
          response = await compilations.detail(await readJsonStdin());
        } else if (process.argv.includes('--decide-pending-compilation')) {
          response = await compilations.decide(await readJsonStdin(), 'plugin:compilation:decide');
          await index.synchronize(vaultRoot);
        } else if (process.argv.includes('--operation-history')) {
          response = compilations.history(await readJsonStdin());
        } else if (process.argv.includes('--list-templates')) {
          response = templates.list(await readJsonStdin());
        } else if (process.argv.includes('--read-template')) {
          response = await templates.read(await readJsonStdin());
        } else if (process.argv.includes('--write-template-version')) {
          response = await templates.write(await readJsonStdin());
        } else {
          response = await mutations.confirm(
            process.env['SECOND_BRAIN_CONFIRMATION_TOKEN'] ?? ''
          );
          await index.synchronize(vaultRoot);
        }
        process.stdout.write(`${JSON.stringify(response)}\n`);
        mutations.close();
        compilations.close();
        templates.close();
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
