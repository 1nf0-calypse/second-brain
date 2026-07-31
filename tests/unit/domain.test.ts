// Beschreibung: Prüft deterministische Delta-Erkennung der infrastrukturfremden Domain.
// Artefakte:    US-000005; ADR-000002
// Agent:        BE — 2026-07-30
import { describe, expect, it } from 'vitest';
import { calculateDelta, type VaultFile } from '../../packages/domain/src/index.js';

const file = (relativePath: string, fingerprint: string): VaultFile => ({
  relativePath,
  fingerprint,
  modifiedAt: 1,
  size: 1
});

describe('calculateDelta', () => {
  it('klassifiziert create, change, delete und unchanged', () => {
    const result = calculateDelta(
      [file('changed.md', 'old'), file('deleted.md', 'old'), file('same.md', 'same')],
      [file('changed.md', 'new'), file('created.md', 'new'), file('same.md', 'same')]
    );

    expect(result.created.map((item) => item.relativePath)).toEqual(['created.md']);
    expect(result.changed.map((item) => item.relativePath)).toEqual(['changed.md']);
    expect(result.deleted).toEqual(['deleted.md']);
    expect(result.unchanged.map((item) => item.relativePath)).toEqual(['same.md']);
  });

  it('liefert für leere Mengen ein leeres Delta', () => {
    expect(calculateDelta([], [])).toEqual({
      created: [],
      changed: [],
      deleted: [],
      unchanged: []
    });
  });
});
