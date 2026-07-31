// Beschreibung: Prüft deterministische explizite Relationship-Extraktion.
// Artefakte:    US-000013; ADR-000003
// Agent:        BE — 2026-07-31
import { describe, expect, it } from 'vitest';
import { extractRelationships } from '../../apps/sidecar/src/relationships/extract-relationships.js';

describe('extractRelationships', () => {
  it('extrahiert Wiki-Links, Tags und Frontmatter-Properties mit Quellen', () => {
    const relationships = extractRelationships(
      'notes/Source.md',
      [
        '---',
        'status: active',
        '---',
        '# Heading',
        'See [[Target|the target]] and #Research.'
      ].join('\n')
    );

    expect(relationships).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'property',
        targetId: 'property:status=active',
        line: 2,
        property: 'status'
      }),
      expect.objectContaining({
        type: 'wiki-link',
        targetId: 'notes/Target.md',
        label: 'the target',
        line: 5
      }),
      expect.objectContaining({
        type: 'tag',
        targetId: 'tag:research',
        line: 5
      })
    ]));
  });

  it('ignoriert Markdown-Überschriften als Tags und dedupliziert identische Quellen', () => {
    const relationships = extractRelationships('Source.md', '# Heading\n#tag #tag');
    expect(relationships).toHaveLength(1);
    expect(relationships[0]?.targetId).toBe('tag:tag');
  });

  it('normalisiert verschachtelte Ziele, bestehende Endungen und leere Werte', () => {
    const relationships = extractRelationships(
      'folder\\Source.md',
      [
        '---',
        'empty:',
        'quoted: "value"',
        '---',
        '[[../Other.txt]] [[nested/Note]] [[Plain]]'
      ].join('\n')
    );
    expect(relationships.map((item) => item.targetId)).toEqual(expect.arrayContaining([
      'Other.txt',
      'nested/Note.md',
      'folder/Plain.md',
      'property:quoted=value'
    ]));
    expect(relationships.some((item) => item.targetId === 'property:empty=')).toBe(false);
  });
});
