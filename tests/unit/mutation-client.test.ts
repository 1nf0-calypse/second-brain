// Beschreibung: Prüft die Laufzeitverträge der Human-in-the-Loop-Plugin-Grenze.
// Artefakte:    US-000014; ADR-000001
// Agent:        FE — 2026-07-31
import { describe, expect, it, vi } from 'vitest';
import {
  confirmNoteChange,
  prepareNoteChange,
  prepareNoteRollback,
  type MutationTransport
} from '../../apps/obsidian-plugin/src/ipc/mutation-client.js';

const preview = {
  token: '11111111-1111-4111-8111-111111111111',
  action: 'update',
  relativePath: 'Note.md',
  beforeHash: 'a'.repeat(64),
  afterHash: 'b'.repeat(64),
  diff: '- before\n+ after',
  expiresAt: '2026-07-31T20:00:00.000Z',
  readOnly: true
} as const;

describe('mutation client', () => {
  it('validates previews, confirmations and rollback previews', async () => {
    const transport: MutationTransport = {
      prepareMutation: vi.fn().mockResolvedValue(preview),
      confirmMutation: vi.fn().mockResolvedValue({
        auditId: '22222222-2222-4222-8222-222222222222',
        action: 'update', relativePath: 'Note.md',
        beforeHash: 'a'.repeat(64), afterHash: 'b'.repeat(64), changed: true
      }),
      prepareRollback: vi.fn().mockResolvedValue({ ...preview, action: 'rollback' })
    };
    await expect(prepareNoteChange(transport, 'C:\\vault', 'Note.md', 'after'))
      .resolves.toMatchObject({ readOnly: true, action: 'update' });
    await expect(confirmNoteChange(transport, 'C:\\vault', preview.token))
      .resolves.toMatchObject({ changed: true });
    await expect(prepareNoteRollback(
      transport, 'C:\\vault', '22222222-2222-4222-8222-222222222222'
    )).resolves.toMatchObject({ action: 'rollback' });
  });

  it('rejects malformed or non-read-only transport responses', async () => {
    const transport: MutationTransport = {
      prepareMutation: () => Promise.resolve({ ...preview, readOnly: false }),
      confirmMutation: () => Promise.resolve({}),
      prepareRollback: () => Promise.resolve({})
    };
    await expect(prepareNoteChange(transport, 'C:\\vault', 'Note.md', 'x')).rejects.toThrow();
    await expect(confirmNoteChange(transport, 'C:\\vault', preview.token)).rejects.toThrow();
  });
});
