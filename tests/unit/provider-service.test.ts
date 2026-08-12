// Beschreibung: Prüft Provider-Grenze, Einmal-Consent und inhaltsfreie Quittungen.
// Artefakte:    US-000001; US-000007; ADR-000006
// Agent:        BE — 2026-08-12
import { describe, expect, it, vi } from 'vitest';
import {
  ConsentService,
  getApprovedProviderConfiguration,
  inspectProviderConnection,
  type ProviderAdapter
} from '../../apps/sidecar/src/providers/provider-service.js';
import { CONTRACT_VERSION } from '../../packages/contracts/src/index.js';

describe('provider service', () => {
  it('reports only a configured endpoint, never a completed provider connection', () => {
    const configuration = {
      ...getApprovedProviderConfiguration('chatgpt'),
      endpoint: 'https://remote.example.invalid/mcp'
    };
    expect(inspectProviderConnection({
      contractVersion: CONTRACT_VERSION,
      provider: 'chatgpt',
      endpoint: configuration.endpoint,
      expectedScope: ['read:notes', 'consent:once']
    }, configuration)).toMatchObject({ configured: true, connected: false });
  });

  it('binds one confirmation to an exact payload and stores no excerpt in its receipt', async () => {
    const service = new ConsentService(() => new Date('2026-08-12T12:00:00.000Z'));
    const preview = service.prepare({
      provider: 'mistral', purpose: 'Answer a question', operation: 'read:notes',
      policyVersion: 'mistral-2026-08-12',
      excerpts: [{ text: 'Only this excerpt may leave the vault.', sourceId: 'source_0001' }]
    });
    const execute = vi.fn().mockResolvedValue(undefined);
    const adapter: ProviderAdapter = { execute };
    const receipt = await service.confirm(preview.confirmationToken, adapter, 'https://connector.example.invalid/mcp');
    expect(execute).toHaveBeenCalledWith(expect.objectContaining({ payloadHash: preview.payloadHash }));
    expect(JSON.stringify(receipt)).not.toContain('Only this excerpt');
    expect(receipt.sourceIds).toEqual(['source_0001']);
    expect(service.revoke(receipt.payloadHash).revokedAt).toBe('2026-08-12T12:00:00.000Z');
  });

  it('rejects replayed confirmation tokens', async () => {
    const service = new ConsentService();
    const preview = service.prepare({
      provider: 'chatgpt', purpose: 'Summarize', operation: 'read:notes', policyVersion: 'v1',
      excerpts: [{ text: 'minimal text', sourceId: 'source_0002' }]
    });
    const adapter: ProviderAdapter = { execute: vi.fn().mockResolvedValue(undefined) };
    await service.confirm(preview.confirmationToken, adapter, 'https://remote.example.invalid/mcp');
    await expect(service.confirm(preview.confirmationToken, adapter, 'https://remote.example.invalid/mcp'))
      .rejects.toThrow('CONSENT_REQUIRED');
  });

  it('rejects expired one-time consent before invoking the provider adapter', async () => {
    let now = new Date('2026-08-12T12:00:00.000Z');
    const service = new ConsentService(() => now);
    const preview = service.prepare({
      provider: 'chatgpt', purpose: 'Summarize', operation: 'read:notes', policyVersion: 'v1',
      excerpts: [{ text: 'minimal text', sourceId: 'source_0003' }]
    });
    const execute = vi.fn().mockResolvedValue(undefined);
    now = new Date('2026-08-12T12:05:00.000Z');
    await expect(service.confirm(
      preview.confirmationToken,
      { execute },
      'https://remote.example.invalid/mcp'
    )).rejects.toThrow('CONSENT_EXPIRED');
    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects excluded fields and non-HTTPS endpoints at the contract boundary', () => {
    const service = new ConsentService();
    expect(() => service.prepare({
      provider: 'mistral', purpose: 'Answer', operation: 'read:notes', policyVersion: 'v1',
      excerpts: [{ text: 'minimal text', sourceId: 'source_0004', relativePath: 'Secret.md' }]
    })).toThrow();
    expect(() => inspectProviderConnection({
      contractVersion: CONTRACT_VERSION,
      provider: 'mistral', endpoint: 'http://localhost:3000/mcp',
      expectedScope: ['read:notes', 'consent:once']
    }, getApprovedProviderConfiguration('mistral'))).toThrow();
  });

  it('keeps a mismatching provider configuration disconnected', () => {
    expect(inspectProviderConnection({
      contractVersion: CONTRACT_VERSION,
      provider: 'chatgpt', endpoint: 'https://other.example.invalid/mcp',
      expectedScope: ['read:notes', 'consent:once']
    }, getApprovedProviderConfiguration('chatgpt'))).toMatchObject({
      configured: false,
      connected: false,
      scopes: []
    });
  });
});
