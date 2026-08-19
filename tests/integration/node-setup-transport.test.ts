// Beschreibung: Prüft den realen Node-Kindprozess einschließlich JSON-stdin für Pending Reviews.
// Artefakte:    US-000011; US-000012; US-000017; BUG-000002; BUG-000003; ADR-000007
// Agent:        BE — 2026-08-15
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RelationshipQueryResponseSchema } from '@second-brain/contracts';
import { NodeSetupTransport } from '../../apps/obsidian-plugin/src/ipc/node-setup-transport.js';
import { CompilationInboxService } from '../../apps/sidecar/src/compilations/compilation-inbox-service.js';

describe('NodeSetupTransport', () => {
  it('startet den Sidecar mit einer expliziten Node-Runtime', async () => {
    const vaultRoot = await mkdtemp(join(tmpdir(), 'second-brain-transport-'));
    await mkdir(join(vaultRoot, '.obsidian'));
    const sidecarEntry = resolve('dist/sidecar/main.js');
    const transport = new NodeSetupTransport(sidecarEntry, process.execPath);

    await expect(transport.testConnection(vaultRoot)).resolves.toMatchObject({
      client: 'claude-desktop',
      capability: 'setup:read',
      vaultReady: true
    });
    await expect(transport.synchronizeIndex(vaultRoot)).resolves.toMatchObject({
      state: 'ready',
      indexedFiles: 0
    });
    await expect(transport.rebuildIndex(vaultRoot)).resolves.toMatchObject({
      state: 'ready',
      indexedFiles: 0
    });
  }, 15_000);

  it('rejects an unreachable user-managed remote endpoint instead of reporting it configured', async () => {
    const transport = new NodeSetupTransport(resolve('dist/sidecar/main.js'), process.execPath);
    await expect(
      transport.inspectProvider('chatgpt', 'https://remote.example.invalid/mcp')
    ).rejects.toThrow('local service');
  }, 15_000);

  it('rejects a provider confirmation that has no persisted review token', async () => {
    const vaultRoot = await mkdtemp(join(tmpdir(), 'second-brain-transport-consent-'));
    await mkdir(join(vaultRoot, '.obsidian'));
    const transport = new NodeSetupTransport(resolve('dist/sidecar/main.js'), process.execPath);

    await expect(transport.confirmProviderTransfer(
      vaultRoot,
      '00000000-0000-4000-8000-000000000000'
    )).rejects.toThrow('CONSENT_REQUIRED');
  }, 15_000);

  it('persists a prepared provider review and consumes its token before a failed remote call', async () => {
    const vaultRoot = await mkdtemp(join(tmpdir(), 'second-brain-transport-provider-review-'));
    await mkdir(join(vaultRoot, '.obsidian'));
    const transport = new NodeSetupTransport(resolve('dist/sidecar/main.js'), process.execPath);
    const preview = await transport.prepareProviderTransfer(vaultRoot, 'https://remote.example.invalid/mcp', {
      provider: 'chatgpt',
      purpose: 'Answer',
      operation: 'read:notes',
      policyVersion: 'chatgpt-2026-08-12',
      excerpts: [{ sourceId: 'source_0009', text: 'Only this reviewed text may be sent.' }]
    }) as { confirmationToken: string; excerpts: Array<{ text: string }> };

    expect(preview.excerpts[0]?.text).toBe('Only this reviewed text may be sent.');
    await expect(transport.confirmProviderTransfer(vaultRoot, preview.confirmationToken))
      .rejects.toThrow('SIDECAR_OFFLINE');
    await expect(transport.confirmProviderTransfer(vaultRoot, preview.confirmationToken))
      .rejects.toThrow('CONSENT_REQUIRED');
  }, 15_000);

  it('durchsucht und liest den Vault über den realen Kindprozess', async () => {
    const vaultRoot = await mkdtemp(join(tmpdir(), 'second-brain-transport-search-'));
    await mkdir(join(vaultRoot, '.obsidian'));
    await writeFile(join(vaultRoot, 'Source.md'), '# Source\nA verifiable citation.');
    const sidecarEntry = resolve('dist/sidecar/main.js');
    const transport = new NodeSetupTransport(sidecarEntry, process.execPath);
    await transport.synchronizeIndex(vaultRoot);

    await expect(transport.searchVault(vaultRoot, 'verifiable')).resolves.toMatchObject({
      semanticAvailable: false,
      results: [expect.objectContaining({ relativePath: 'Source.md', line: 2 })]
    });
    await expect(transport.readNote(vaultRoot, 'Source.md', 2)).resolves.toMatchObject({
      relativePath: 'Source.md',
      requestedLine: 2
    });
  }, 15_000);

  it('liefert Beziehungen über den realen Kindprozess read-only aus', async () => {
    const vaultRoot = await mkdtemp(join(tmpdir(), 'second-brain-transport-relationships-'));
    await mkdir(join(vaultRoot, '.obsidian'));
    await writeFile(join(vaultRoot, 'Source.md'), 'See [[Target]].');
    await writeFile(join(vaultRoot, 'Target.md'), '# Target');
    const transport = new NodeSetupTransport(resolve('dist/sidecar/main.js'), process.execPath);
    await transport.synchronizeIndex(vaultRoot);

    const response = RelationshipQueryResponseSchema.parse(
      await transport.relationships(vaultRoot, 'Source.md')
    );
    expect(response).toMatchObject({ relativePath: 'Source.md', readOnly: true });
    expect(response.relationships.some((relationship) =>
      relationship.type === 'wiki-link' &&
      relationship.target.relativePath === 'Target.md'
    )).toBe(true);
  }, 15_000);

  it('transportiert Scope-Ablehnungen mit stabilem öffentlichem Fehlercode', async () => {
    const vaultRoot = await mkdtemp(join(tmpdir(), 'second-brain-transport-scope-'));
    await mkdir(join(vaultRoot, '.obsidian'));
    const sidecarEntry = resolve('dist/sidecar/main.js');
    const transport = new NodeSetupTransport(sidecarEntry, process.execPath);

    await expect(
      transport.readNote(vaultRoot, '..\\outside.md')
    ).rejects.toThrow('PATH_OUTSIDE_VAULT');
  }, 15_000);

  it('hält Vorschau und Bestätigung über getrennte Sidecar-Prozesse gebunden', async () => {
    const vaultRoot = await mkdtemp(join(tmpdir(), 'second-brain-transport-mutation-'));
    await mkdir(join(vaultRoot, '.obsidian'));
    await writeFile(join(vaultRoot, 'Note.md'), 'before');
    const transport = new NodeSetupTransport(resolve('dist/sidecar/main.js'), process.execPath);

    const preview = await transport.prepareMutation(vaultRoot, 'Note.md', 'after') as {
      token: string; readOnly: boolean;
    };
    expect(preview.readOnly).toBe(true);
    const result = await transport.confirmMutation(vaultRoot, preview.token);
    expect(result).toMatchObject({ action: 'update', relativePath: 'Note.md', changed: true });
    await expect(transport.confirmMutation(vaultRoot, preview.token))
      .rejects.toThrow('CONFIRMATION_INVALID');
  }, 15_000);

  it('transportiert große Pending-Payloads über JSON-stdin und bewahrt Decision-Codes', async () => {
    const vaultRoot = await mkdtemp(join(tmpdir(), 'second-brain-transport-compilation-'));
    await mkdir(join(vaultRoot, '.obsidian'));
    await mkdir(join(vaultRoot, '.second-brain'));
    await writeFile(join(vaultRoot, 'Source.md'), 'facts');
    const databasePath = join(vaultRoot, '.second-brain', 'index.sqlite');
    const service = new CompilationInboxService(vaultRoot, databasePath, 'mcp:test', 'Test MCP');
    const submitted = await service.submit({
      contractVersion: '3.0.0', clientRequestId: 'transport-request',
      target: { relativePath: 'Result.md', content: `# Result\n${'x'.repeat(128_000)}` },
      sources: [{ relativePath: 'Source.md', expectedHash: createHash('sha256').update('facts').digest('hex') }],
      template: null
    });
    service.close();
    const transport = new NodeSetupTransport(resolve('dist/sidecar/main.js'), process.execPath);
    await expect(transport.pendingCompilationSummary(vaultRoot)).resolves.toMatchObject({ count: 1 });
    await expect(transport.listPendingCompilations(vaultRoot, { limit: 10 })).resolves.toMatchObject({ items: [expect.objectContaining({ pendingId: submitted.pendingId })] });
    const detail = await transport.getPendingCompilation(vaultRoot, { pendingId: submitted.pendingId }) as { revision: number; decisionToken: string; content: string };
    expect(detail.content).toHaveLength(128_009);
    await expect(transport.decidePendingCompilation(vaultRoot, {
      pendingId: submitted.pendingId, revision: detail.revision,
      decision: 'reject', decisionToken: detail.decisionToken
    })).resolves.toMatchObject({ state: 'rejected' });
    await expect(readFile(join(vaultRoot, 'Result.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
  }, 20_000);
});
