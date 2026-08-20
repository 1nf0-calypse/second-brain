// Beschreibung: Prüft die Laufzeitvalidierung der lokalen Graph-Plugin-Grenze.
// Artefakte:    US-000004; UX-000005; ADR-000001
// Agent:        FE — 2026-08-20
import { describe, expect, it } from 'vitest';
import {
  getLocalGraph,
  type LocalGraphTransport
} from '../../apps/obsidian-plugin/src/ipc/local-graph-client.js';

describe('getLocalGraph', () => {
  it('synchronisiert vor der read-only Graph-Abfrage und validiert die Antwort', async () => {
    const operations: string[] = [];
    const transport: LocalGraphTransport = {
      synchronizeIndex: () => {
        operations.push('synchronize');
        return Promise.resolve({ state: 'ready' });
      },
      localGraph: () => {
        operations.push('local-graph');
        return Promise.resolve({
          focus: {
            relativePath: 'Note.md', title: 'Note', extractionStatus: 'extracted',
            outgoingCount: 0, incomingCount: 0, readOnly: true
          },
          nodes: [{
            kind: 'note', id: 'Note.md', label: 'Note', relativePath: 'Note.md',
            resolved: true, extractionStatus: 'extracted'
          }],
          relationships: [],
          readOnly: true
        });
      }
    };
    await expect(getLocalGraph(transport, 'C:\\vault', 'Note.md')).resolves.toMatchObject({
      readOnly: true,
      focus: { relativePath: 'Note.md' }
    });
    expect(operations).toEqual(['synchronize', 'local-graph']);
  });

  it('weist schreibfähige oder strukturell ungültige Graph-Antworten zurück', async () => {
    const transport: LocalGraphTransport = {
      synchronizeIndex: () => Promise.resolve({ state: 'ready' }),
      localGraph: () => Promise.resolve({ readOnly: false })
    };
    await expect(getLocalGraph(transport, 'C:\\vault', 'Note.md')).rejects.toThrow();
  });

  it('fragt bei fehlgeschlagener Synchronisierung keinen Graphen ab', async () => {
    let queried = false;
    const transport: LocalGraphTransport = {
      synchronizeIndex: () => Promise.reject(new Error('Index unavailable')),
      localGraph: () => {
        queried = true;
        return Promise.resolve({});
      }
    };
    await expect(getLocalGraph(transport, 'C:\\vault', 'Note.md')).rejects.toThrow('Index unavailable');
    expect(queried).toBe(false);
  });
});
