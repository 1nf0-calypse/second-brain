// Beschreibung: Prüft den bestätigungspflichtigen Mutationsfluss über echtes MCP/stdio.
// Artefakte:    US-000014; ADR-000001; ADR-000004
// Agent:        BE — 2026-07-31
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { afterEach, describe, expect, it } from 'vitest';

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

function textResult(result: unknown): Record<string, unknown> {
  const block = CallToolResultSchema.parse(result).content[0];
  if (!block || block.type !== 'text') throw new Error('Expected MCP text result.');
  return JSON.parse(block.text) as Record<string, unknown>;
}

describe('MCP note mutations', () => {
  it('advertises preview/confirm tools and never writes during prepare', async () => {
    const vaultRoot = await mkdtemp(join(tmpdir(), 'second-brain-mcp-mutation-'));
    roots.push(vaultRoot);
    await mkdir(join(vaultRoot, '.obsidian'));
    await writeFile(join(vaultRoot, 'Note.md'), 'before');
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [resolve('dist/sidecar/main.js')],
      env: {
        SECOND_BRAIN_VAULT_ROOT: vaultRoot,
        SECOND_BRAIN_INDEX_PATH: join(vaultRoot, '.second-brain', 'index.sqlite')
      }
    });
    const client = new Client({ name: 'mutation-test', version: '1.0.0' });
    try {
      await client.connect(transport);
      const names = (await client.listTools()).tools.map((tool) => tool.name);
      expect(names).toEqual(expect.arrayContaining([
        'second_brain_prepare_note_change',
        'second_brain_confirm_note_change',
        'second_brain_prepare_rollback',
        'second_brain_confirm_rollback'
      ]));
      const prepared = textResult(await client.callTool({
        name: 'second_brain_prepare_note_change',
        arguments: { relativePath: 'Note.md', content: 'after' }
      }));
      expect(prepared).toMatchObject({ action: 'update', readOnly: true });
      expect(await readFile(join(vaultRoot, 'Note.md'), 'utf8')).toBe('before');
      const confirmed = textResult(await client.callTool({
        name: 'second_brain_confirm_note_change',
        arguments: { token: prepared['token'] }
      }));
      expect(confirmed).toMatchObject({ changed: true, relativePath: 'Note.md' });
      expect(await readFile(join(vaultRoot, 'Note.md'), 'utf8')).toBe('after');
    } finally {
      await client.close();
    }
  }, 20_000);
});
