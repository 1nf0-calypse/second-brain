// Beschreibung: Prüft die Laufzeitvalidierung der Relationship-Plugin-Grenze.
// Artefakte:    US-000013; BUG-000004; ADR-000001
// Agent:        FE — 2026-07-31
import { describe, expect, it } from 'vitest';
import {
  getRelationships,
  type RelationshipTransport
} from '../../apps/obsidian-plugin/src/ipc/relationship-client.js';

describe('getRelationships', () => {
  it('akzeptiert nur den versionierten read-only Vertrag', async () => {
    const operations: string[] = [];
    const transport: RelationshipTransport = {
      synchronizeIndex: () => {
        operations.push('synchronize');
        return Promise.resolve({ state: 'ready' });
      },
      relationships: () => {
        operations.push('relationships');
        return Promise.resolve({
          relativePath: 'Note.md',
          readOnly: true,
          relationships: []
        });
      }
    };
    await expect(getRelationships(transport, 'C:\\vault', 'Note.md')).resolves.toMatchObject({
      relativePath: 'Note.md',
      readOnly: true
    });
    expect(operations).toEqual(['synchronize', 'relationships']);
  });

  it('weist schreibfähige oder strukturell ungültige Antworten zurück', async () => {
    const transport: RelationshipTransport = {
      synchronizeIndex: () => Promise.resolve({ state: 'ready' }),
      relationships: () => Promise.resolve({
        relativePath: 'Note.md',
        readOnly: false,
        relationships: []
      })
    };
    await expect(getRelationships(transport, 'C:\\vault', 'Note.md')).rejects.toThrow();
  });

  it('fragt bei fehlgeschlagener Indexaktualisierung keine veralteten Beziehungen ab', async () => {
    let queried = false;
    const transport: RelationshipTransport = {
      synchronizeIndex: () => Promise.reject(new Error('Index unavailable')),
      relationships: () => {
        queried = true;
        return Promise.resolve({});
      }
    };
    await expect(getRelationships(transport, 'C:\\vault', 'Note.md')).rejects.toThrow(
      'Index unavailable'
    );
    expect(queried).toBe(false);
  });
});
