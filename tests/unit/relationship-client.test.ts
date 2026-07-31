// Beschreibung: Prüft die Laufzeitvalidierung der Relationship-Plugin-Grenze.
// Artefakte:    US-000013; ADR-000001
// Agent:        FE — 2026-07-31
import { describe, expect, it } from 'vitest';
import {
  getRelationships,
  type RelationshipTransport
} from '../../apps/obsidian-plugin/src/ipc/relationship-client.js';

describe('getRelationships', () => {
  it('akzeptiert nur den versionierten read-only Vertrag', async () => {
    const transport: RelationshipTransport = {
      relationships: () => Promise.resolve({
        relativePath: 'Note.md',
        readOnly: true,
        relationships: []
      })
    };
    await expect(getRelationships(transport, 'C:\\vault', 'Note.md')).resolves.toMatchObject({
      relativePath: 'Note.md',
      readOnly: true
    });
  });

  it('weist schreibfähige oder strukturell ungültige Antworten zurück', async () => {
    const transport: RelationshipTransport = {
      relationships: () => Promise.resolve({
        relativePath: 'Note.md',
        readOnly: false,
        relationships: []
      })
    };
    await expect(getRelationships(transport, 'C:\\vault', 'Note.md')).rejects.toThrow();
  });
});
