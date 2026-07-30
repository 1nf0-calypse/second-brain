// Beschreibung: Prüft den Windows-Setup-Pfad auf Vertrags-, Timeout- und Scope-Ebene.
// Artefakte:    US-000011; UX-000002
// Agent:        FE — 2026-07-30
import { describe, expect, it } from 'vitest';
import { CONTRACT_VERSION } from '../../packages/contracts/src/index.js';
import {
  testClaudeConnection,
  type SetupTransport
} from '../../apps/obsidian-plugin/src/ipc/setup-client.js';
import {
  createConfigurationPreview,
  formatIndexStatus
} from '../../apps/obsidian-plugin/src/ui/presentation.js';

describe('setup flow', () => {
  it('meldet eine gültige read-only Verbindung', async () => {
    const transport: SetupTransport = {
      testConnection: () =>
        Promise.resolve({
          contractVersion: CONTRACT_VERSION,
          client: 'claude-desktop',
          capability: 'setup:read',
          vaultReady: true,
          message: 'Claude Desktop connected with read-only setup access.'
        })
    };
    await expect(testClaudeConnection(transport, 'C:\\vault')).resolves.toMatchObject({
      vaultReady: true
    });
  });

  it('propagiert Timeout und Offline-Fehler als sichere Fehlerzustände', async () => {
    const transport: SetupTransport = {
      testConnection: () => Promise.reject(new Error('Claude Desktop did not respond in time.'))
    };
    await expect(testClaudeConnection(transport, 'C:\\vault')).rejects.toThrow(
      'did not respond in time'
    );
  });

  it('zeigt keine zusätzlichen Clients oder API-Keys in der Vorschau', () => {
    const preview = JSON.stringify(createConfigurationPreview('C:\\vault'));
    expect(preview).toContain('second-brain');
    expect(preview).not.toContain('chatgpt');
    expect(preview).not.toContain('mistral');
    expect(preview.toLowerCase()).not.toContain('api_key');
  });

  it('weist beim Indexstatus unveränderte Originaldateien aus', () => {
    expect(
      formatIndexStatus({
        state: 'ready',
        indexedFiles: 2,
        changedFiles: 1,
        deletedFiles: 0,
        originalFilesUnchanged: true,
        message: 'Index ready.'
      })
    ).toContain('Original files unchanged.');
  });
});
