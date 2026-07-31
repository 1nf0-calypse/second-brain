// Beschreibung: Minimaler read-only MCP-Gateway für Setup- und Indexstatus.
// Artefakte:    US-000011; US-000005; ADR-000001; ADR-000004
// Agent:        BE — 2026-07-30
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { CONTRACT_VERSION } from '@second-brain/contracts';
import { LocalIndex } from '../indexing/sqlite-index.js';
import { performSetupHandshake } from '../bootstrap/setup-service.js';
import { validateVaultRoot } from '../policy/vault-root.js';

/**
 * Startet den MCP-Server über stdio.
 * @param vaultRoot Konfigurierter Vault-Root.
 * @param indexPath Lokaler SQLite-Indexpfad.
 * @returns Promise, das nach Transportverbindung erfüllt wird.
 * @throws Bei ungültigem Vault oder Transportfehler.
 * @sideEffect Nutzt stdout ausschließlich für MCP und schreibt in den lokalen Index.
 */
export async function startMcpServer(vaultRoot: string, indexPath: string): Promise<void> {
  const canonicalVault = await validateVaultRoot(vaultRoot);
  const index = new LocalIndex(indexPath);
  // Der Low-Level-Server ist hier bewusst gewählt, weil die Capability-Liste statisch und
  // streng read-only ist; der High-Level-Wrapper würde keine zusätzliche Policy liefern.
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const server = new Server(
    { name: 'second-brain', version: '2.2.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: [
      {
        name: 'second_brain_setup_status',
        description: 'Validates the approved local vault and read-only setup contract.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      },
      {
        name: 'second_brain_rebuild_index',
        description: 'Rebuilds the derived local index without modifying vault files.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === 'second_brain_setup_status') {
      const result = await performSetupHandshake({
        contractVersion: CONTRACT_VERSION,
        client: 'claude-desktop',
        vaultRoot: canonicalVault
      });
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }
    if (request.params.name === 'second_brain_rebuild_index') {
      const status = await index.rebuild(canonicalVault);
      return { content: [{ type: 'text', text: JSON.stringify(status) }] };
    }
    throw new Error(`Unknown read-only tool: ${request.params.name}`);
  });

  await index.synchronize(canonicalVault);
  await server.connect(new StdioServerTransport());
}
