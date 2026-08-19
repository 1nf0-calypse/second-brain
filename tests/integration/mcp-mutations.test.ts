// Beschreibung: Prüft Mutations- und MCP-first-Compilation-Flows über echtes MCP/stdio.
// Artefakte:    US-000014; US-000017; ADR-000001; ADR-000004; ADR-000007
// Agent:        BE — 2026-08-15
import { createHash } from 'node:crypto';
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
  it('submits and reads an inbox proposal without exposing a decision capability', async () => {
    const vaultRoot = await mkdtemp(join(tmpdir(), 'second-brain-mcp-compilation-'));
    roots.push(vaultRoot);
    await mkdir(join(vaultRoot, '.obsidian'));
    await writeFile(join(vaultRoot, 'Source.md'), 'verified facts');
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [resolve('dist/sidecar/main.js')],
      env: { SECOND_BRAIN_VAULT_ROOT: vaultRoot, SECOND_BRAIN_INDEX_PATH: join(vaultRoot, '.second-brain', 'index.sqlite') }
    });
    const client = new Client({ name: 'compilation-test', version: '3.0.0' });
    try {
      await client.connect(transport);
      const names = (await client.listTools()).tools.map((tool) => tool.name);
      expect(names).toEqual(expect.arrayContaining(['second_brain_submit_compilation', 'second_brain_compilation_status']));
      expect(names).not.toContain('second_brain_prepare_compilation');
      expect(names.some((name) => /decide.*compilation/iu.test(name))).toBe(false);
      const submitted = textResult(await client.callTool({
        name: 'second_brain_submit_compilation',
        arguments: {
          contractVersion: '3.0.0', clientRequestId: 'mcp-request-1',
          target: { relativePath: 'Result.md', content: '# Result' },
          sources: [{ relativePath: 'Source.md', expectedHash: createHash('sha256').update('verified facts').digest('hex') }],
          template: null
        }
      }));
      expect(submitted['state']).toBe('pending');
      expect(typeof submitted['pendingId']).toBe('string');
      expect(submitted).not.toHaveProperty('decisionToken');
      const status = textResult(await client.callTool({ name: 'second_brain_compilation_status', arguments: { pendingId: submitted['pendingId'] } }));
      expect(status).toMatchObject({ state: 'pending' });
      expect(status).not.toHaveProperty('decisionToken');
      await expect(readFile(join(vaultRoot, 'Result.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    } finally {
      await client.close();
    }
  }, 20_000);

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
      const rollback = textResult(await client.callTool({
        name: 'second_brain_prepare_rollback',
        arguments: { auditId: confirmed['auditId'] }
      }));
      expect(rollback).toMatchObject({ action: 'rollback', readOnly: true });
      expect(await readFile(join(vaultRoot, 'Note.md'), 'utf8')).toBe('after');
      const rolledBack = textResult(await client.callTool({
        name: 'second_brain_confirm_rollback',
        arguments: { token: rollback['token'] }
      }));
      expect(rolledBack).toMatchObject({ action: 'rollback', changed: true });
      expect(await readFile(join(vaultRoot, 'Note.md'), 'utf8')).toBe('before');
    } finally {
      await client.close();
    }
  }, 20_000);
});
