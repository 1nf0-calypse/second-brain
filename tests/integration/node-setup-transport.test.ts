// Beschreibung: Prüft den realen Node-Kindprozess des Obsidian-Setup-Transports.
// Artefakte:    US-000011; BUG-000002
// Agent:        FE — 2026-07-30
import { mkdtemp, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
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
  });
});
