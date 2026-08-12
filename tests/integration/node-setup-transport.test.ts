// Beschreibung: Prüft den realen Node-Kindprozess des Obsidian-Setup-Transports.
// Artefakte:    US-000011; US-000012; BUG-000002; BUG-000003
// Agent:        FE — 2026-07-31
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RelationshipQueryResponseSchema } from '@second-brain/contracts';
import { NodeSetupTransport } from '../../apps/obsidian-plugin/src/ipc/node-setup-transport.js';

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
});
