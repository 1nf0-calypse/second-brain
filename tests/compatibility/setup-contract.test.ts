// Beschreibung: Prüft Claude-Desktop-Vertrag, Client-Scope und Konfiguration.
// Artefakte:    US-000011; ADR-000001
// Agent:        BE — 2026-07-30
import { mkdtemp, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONTRACT_VERSION } from '../../packages/contracts/src/index.js';
import {
  createClaudeDesktopConfiguration,
  performSetupHandshake
} from '../../apps/sidecar/src/bootstrap/setup-service.js';

async function createVault(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'second-brain-setup-'));
  await mkdir(join(root, '.obsidian'));
  return root;
}

describe('Claude Desktop setup contract', () => {
  it('liefert ausschließlich den read-only Claude-Scope', async () => {
    const root = await createVault();
    const result = await performSetupHandshake({
      contractVersion: CONTRACT_VERSION,
      client: 'claude-desktop',
      vaultRoot: root
    });
    expect(result.capability).toBe('setup:read');
    expect(result.client).toBe('claude-desktop');
  });

  it('lehnt inkompatible Verträge und andere Clients ab', async () => {
    const root = await createVault();
    await expect(
      performSetupHandshake({
        contractVersion: '2.0.0',
        client: 'claude-desktop',
        vaultRoot: root
      })
    ).rejects.toThrow();
    await expect(
      performSetupHandshake({
        contractVersion: CONTRACT_VERSION,
        client: 'chatgpt',
        vaultRoot: root
      })
    ).rejects.toThrow();
  });

  it('erzeugt eine lokale stdio-Konfiguration ohne API-Key', () => {
    const config = createClaudeDesktopConfiguration('C:\\second-brain\\main.js', 'C:\\vault');
    const serialized = JSON.stringify(config);
    expect(config).toMatchObject({
      mcpServers: {
        'second-brain': {
          command: 'node',
          args: ['C:\\second-brain\\main.js']
        }
      }
    });
    expect(serialized).toContain('SECOND_BRAIN_VAULT_ROOT');
    expect(serialized.toLowerCase()).not.toContain('api_key');
  });
});
