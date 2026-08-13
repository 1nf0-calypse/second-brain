// Beschreibung: Capability-basiertes MCP-Gateway für Lesen, Mutationen und serverseitige Autonomie.
// Artefakte:    US-000003; US-000011; US-000014; ADR-000001; ADR-000004
// Agent:        BE — 2026-08-13
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import {
  CONTRACT_VERSION,
  MutationConfirmRequestSchema,
  MutationPrepareRequestSchema,
  AutonomyActivationRequestSchema,
  AutonomousMutationRequestSchema,
  NodeDetailRequestSchema,
  RelationshipQueryRequestSchema,
  RollbackPrepareRequestSchema
} from '@second-brain/contracts';
import { LocalIndex } from '../indexing/sqlite-index.js';
import { performSetupHandshake } from '../bootstrap/setup-service.js';
import { validateVaultRoot } from '../policy/vault-root.js';
import { SearchService } from '../search/search-service.js';
import { toMcpToolError } from '../errors/public-error.js';
import { MutationService } from '../mutations/mutation-service.js';

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
  const mutations = new MutationService(canonicalVault, indexPath);
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
      },
      {
        name: 'second_brain_prepare_note_change',
        description: 'Creates a read-only preview for one Markdown create or update. Does not change the vault.',
        inputSchema: {
          type: 'object',
          properties: {
            relativePath: { type: 'string', minLength: 1 },
            content: { type: 'string', maxLength: 2000000 }
          },
          required: ['relativePath', 'content'],
          additionalProperties: false
        }
      },
      {
        name: 'second_brain_confirm_note_change',
        description: 'Applies exactly one previously previewed note change using its confirmation token.',
        inputSchema: {
          type: 'object',
          properties: { token: { type: 'string', format: 'uuid' } },
          required: ['token'],
          additionalProperties: false
        }
      },
      {
        name: 'second_brain_prepare_rollback',
        description: 'Creates a read-only rollback preview for one audited mutation.',
        inputSchema: {
          type: 'object',
          properties: { auditId: { type: 'string', format: 'uuid' } },
          required: ['auditId'],
          additionalProperties: false
        }
      },
      {
        name: 'second_brain_confirm_rollback',
        description: 'Applies one previously previewed rollback using its confirmation token.',
        inputSchema: {
          type: 'object',
          properties: { token: { type: 'string', format: 'uuid' } },
          required: ['token'],
          additionalProperties: false
        }
      }
      ,{
        name: 'second_brain_activate_autonomy',
        description: 'Activates a reviewed Human-on or Human-out policy for at most 60 Markdown creates or updates in one hour. Deletes are excluded.',
        inputSchema: { type: 'object', properties: { mode: { type: 'string', enum: ['human-on', 'human-out'] }, reviewed: { type: 'boolean', const: true } }, required: ['mode', 'reviewed'], additionalProperties: false }
      },
      {
        name: 'second_brain_autonomy_status',
        description: 'Returns the server-owned autonomy mode, remaining budget, expiry and pause state.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false }
      },
      {
        name: 'second_brain_pause_autonomy',
        description: 'Immediately blocks new automatic mutations and returns to human-in-the-loop confirmation.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false }
      },
      {
        name: 'second_brain_apply_autonomous_note_change',
        description: 'Applies one allowed Markdown create or update only while the server-owned autonomy policy has remaining budget. Deletes, moves and renames are blocked.',
        inputSchema: { type: 'object', properties: { relativePath: { type: 'string', minLength: 1 }, content: { type: 'string', maxLength: 2000000 } }, required: ['relativePath', 'content'], additionalProperties: false }
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
      if (request.params.name === 'second_brain_prepare_note_change') {
        const input = MutationPrepareRequestSchema.parse(request.params.arguments ?? {});
        const result = await mutations.prepare(input.relativePath, input.content);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
      }
      if (request.params.name === 'second_brain_activate_autonomy') {
        const input = AutonomyActivationRequestSchema.parse(request.params.arguments ?? {});
        const result = mutations.activateAutonomy(input);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
      }
      if (request.params.name === 'second_brain_autonomy_status') {
        return { content: [{ type: 'text' as const, text: JSON.stringify(mutations.autonomyStatus()) }] };
      }
      if (request.params.name === 'second_brain_pause_autonomy') {
        return { content: [{ type: 'text' as const, text: JSON.stringify(await mutations.pauseAutonomy()) }] };
      }
      if (request.params.name === 'second_brain_apply_autonomous_note_change') {
        const input = AutonomousMutationRequestSchema.parse(request.params.arguments ?? {});
        const result = await mutations.executeAutonomous(input);
        await index.synchronize(canonicalVault);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
      }
      if (
        request.params.name === 'second_brain_confirm_note_change' ||
        request.params.name === 'second_brain_confirm_rollback'
      ) {
        const input = MutationConfirmRequestSchema.parse(request.params.arguments ?? {});
        const result = await mutations.confirm(input.token);
        await index.synchronize(canonicalVault);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
      }
      if (request.params.name === 'second_brain_prepare_rollback') {
        const input = RollbackPrepareRequestSchema.parse(request.params.arguments ?? {});
        const result = await mutations.prepareRollback(input.auditId);
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
