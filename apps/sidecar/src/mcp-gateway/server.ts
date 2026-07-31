// Beschreibung: Read-only MCP-Gateway für Setup, Index, Suche und Quellenlesen.
// Artefakte:    US-000011; US-000005; US-000012; US-000013; ADR-000001; ADR-000004
// Agent:        BE — 2026-07-31
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import {
  CONTRACT_VERSION,
  NodeDetailRequestSchema,
  RelationshipQueryRequestSchema
} from '@second-brain/contracts';
import { LocalIndex } from '../indexing/sqlite-index.js';
import { performSetupHandshake } from '../bootstrap/setup-service.js';
import { validateVaultRoot } from '../policy/vault-root.js';
import { SearchService } from '../search/search-service.js';
import { toMcpToolError } from '../errors/public-error.js';

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
  const search = new SearchService(canonicalVault, index);
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
      },
      {
        name: 'second_brain_search',
        description:
          'Searches extracted local vault text and returns citations. Read-only; semantic search may be unavailable.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', minLength: 1, maxLength: 500 },
            limit: { type: 'integer', minimum: 1, maximum: 50 }
          },
          required: ['query'],
          additionalProperties: false
        }
      },
      {
        name: 'second_brain_read_note',
        description:
          'Reads one cited Markdown or text note inside the approved vault root. Read-only.',
        inputSchema: {
          type: 'object',
          properties: {
            relativePath: { type: 'string', minLength: 1 },
            line: { type: 'integer', minimum: 1 }
          },
          required: ['relativePath'],
          additionalProperties: false
        }
      },
      {
        name: 'second_brain_relationships',
        description:
          'Lists explicit direct wiki links, backlinks, tags, and properties for an indexed note. Read-only.',
        inputSchema: {
          type: 'object',
          properties: {
            relativePath: { type: 'string', minLength: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 200 }
          },
          required: ['relativePath'],
          additionalProperties: false
        }
      },
      {
        name: 'second_brain_node_detail',
        description:
          'Returns read-only metadata and direct relationship counts for an indexed note.',
        inputSchema: {
          type: 'object',
          properties: { relativePath: { type: 'string', minLength: 1 } },
          required: ['relativePath'],
          additionalProperties: false
        }
      }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      if (request.params.name === 'second_brain_setup_status') {
        const result = await performSetupHandshake({
          contractVersion: CONTRACT_VERSION,
          client: 'claude-desktop',
          vaultRoot: canonicalVault
        });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
      }
      if (request.params.name === 'second_brain_rebuild_index') {
        const status = await index.rebuild(canonicalVault);
        return { content: [{ type: 'text' as const, text: JSON.stringify(status) }] };
      }
      if (request.params.name === 'second_brain_search') {
        const result = search.search(request.params.arguments ?? {});
        return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
      }
      if (request.params.name === 'second_brain_read_note') {
        const result = await search.readNote(request.params.arguments ?? {});
        return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
      }
      if (request.params.name === 'second_brain_relationships') {
        const input = RelationshipQueryRequestSchema.parse(request.params.arguments ?? {});
        const result = index.relationships(input.relativePath, input.limit);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
      }
      if (request.params.name === 'second_brain_node_detail') {
        const input = NodeDetailRequestSchema.parse(request.params.arguments ?? {});
        const result = index.nodeDetail(input.relativePath);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
      }
    } catch (error: unknown) {
      return toMcpToolError(error);
    }
    throw new Error(`Unknown read-only tool: ${request.params.name}`);
  });

  await index.synchronize(canonicalVault);
  await server.connect(new StdioServerTransport());
}
