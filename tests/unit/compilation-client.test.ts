// Beschreibung: Prueft die Contract-3-Laufzeitgrenze des Obsidian-Plugins.
// Artefakte:    US-000017; US-000016; US-000008; ADR-000007
// Agent:        FE — 2026-08-15
import { describe, expect, it, vi } from 'vitest';
import {
  decidePendingCompilation,
  getOperationHistory,
  getPendingCompilation,
  getPendingCompilationSummary,
  listPendingCompilations,
  type CompilationInboxTransport
} from '../../apps/obsidian-plugin/src/ipc/compilation-client.js';
import { listTemplates, readTemplate, writeTemplateVersion, type TemplateStoreTransport } from '../../apps/obsidian-plugin/src/ipc/template-client.js';

const id = '11111111-1111-4111-8111-111111111111';
const now = '2026-08-15T10:00:00.000Z';
const later = '2026-08-15T11:00:00.000Z';

describe('Contract 3 plugin clients', () => {
  it('validates inbox metadata, rotated detail and the exact decision request', async () => {
    const transport: CompilationInboxTransport = {
      pendingCompilationSummary: vi.fn().mockResolvedValue({ count: 1, revision: 2, oldestExpiresAt: later }),
      listPendingCompilations: vi.fn().mockResolvedValue({ items: [{ pendingId: id, revision: 2, targetPath: 'Result.md', clientName: 'Test MCP', sourceCount: 1, warningCount: 0, createdAt: now, expiresAt: later }], nextCursor: null }),
      getPendingCompilation: vi.fn().mockResolvedValue({ pendingId: id, revision: 3, state: 'pending', clientName: 'Test MCP', targetPath: 'Result.md', beforeHash: null, afterHash: 'a'.repeat(64), content: '# Result', diff: '+ # Result', sources: [{ relativePath: 'Source.md', hash: 'b'.repeat(64) }], template: null, warnings: [], decisionToken: id, decisionExpiresAt: later, createdAt: now, expiresAt: later }),
      decidePendingCompilation: vi.fn().mockResolvedValue({ pendingId: id, state: 'confirmed', revision: 4, auditId: id, decidedAt: now }),
      operationHistory: vi.fn().mockResolvedValue({ entries: [], nextCursor: null })
    };
    await expect(getPendingCompilationSummary(transport, 'C:\\vault')).resolves.toMatchObject({ count: 1 });
    await expect(listPendingCompilations(transport, 'C:\\vault')).resolves.toMatchObject({ items: [{ targetPath: 'Result.md' }] });
    const detail = await getPendingCompilation(transport, 'C:\\vault', id);
    await expect(decidePendingCompilation(transport, 'C:\\vault', { pendingId: id, revision: detail.revision, decision: 'confirm', decisionToken: detail.decisionToken })).resolves.toMatchObject({ state: 'confirmed' });
    await expect(getOperationHistory(transport, 'C:\\vault')).resolves.toMatchObject({ entries: [] });
  });

  it('rejects malformed projections and validates immutable template versions', async () => {
    const bad: CompilationInboxTransport = {
      pendingCompilationSummary: () => Promise.resolve({ count: -1 }), listPendingCompilations: () => Promise.resolve({}),
      getPendingCompilation: () => Promise.resolve({}), decidePendingCompilation: () => Promise.resolve({}), operationHistory: () => Promise.resolve({})
    };
    await expect(getPendingCompilationSummary(bad, 'C:\\vault')).rejects.toThrow();
    const stored = { id, name: 'Sprint review', version: 1, hash: 'c'.repeat(64), content: '# Template', createdAt: now };
    const templates: TemplateStoreTransport = {
      listTemplates: vi.fn().mockResolvedValue({ items: [{ id, name: stored.name, latestVersion: 1, versions: [{ version: 1, hash: stored.hash, createdAt: now }] }], nextCursor: null }),
      readTemplate: vi.fn().mockResolvedValue(stored), writeTemplateVersion: vi.fn().mockResolvedValue(stored)
    };
    await expect(listTemplates(templates, 'C:\\vault')).resolves.toMatchObject({ items: [{ latestVersion: 1 }] });
    await expect(readTemplate(templates, 'C:\\vault', id, 1)).resolves.toMatchObject({ content: '# Template' });
    await expect(writeTemplateVersion(templates, 'C:\\vault', { name: stored.name, content: stored.content })).resolves.toMatchObject({ version: 1 });
  });
});
