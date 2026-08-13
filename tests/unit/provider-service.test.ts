// Beschreibung: Prüft Provider-Grenze, Einmal-Consent und inhaltsfreie Quittungen.
// Artefakte:    US-000001; US-000007; ADR-000006
// Agent:        BE — 2026-08-12
import { describe, expect, it, vi } from 'vitest';
import {
  ConsentService,
  inspectProviderConnection,
  RemoteMcpProviderAdapter,
  type ProviderAdapter
} from '../../apps/sidecar/src/providers/provider-service.js';
import { CONTRACT_VERSION } from '../../packages/contracts/src/index.js';

describe('provider service', () => {
  it('reports a completed connection only after the remote adapter proves required scopes', async () => {
    expect(await inspectProviderConnection({
      contractVersion: CONTRACT_VERSION,
      provider: 'chatgpt',
      endpoint: 'https://remote.example.invalid/mcp',
      expectedScope: ['read:notes', 'consent:once']
    }, { handshake: vi.fn().mockResolvedValue(['read:notes', 'consent:once']), execute: vi.fn() })).toMatchObject({ configured: true, connected: true });
  });

  it('binds one confirmation to an exact payload and stores no excerpt in its receipt', async () => {
    const service = new ConsentService(() => new Date('2026-08-12T12:00:00.000Z'));
    const preview = service.prepare({
      provider: 'mistral', purpose: 'Answer a question', operation: 'read:notes',
      policyVersion: 'mistral-2026-08-12',
      excerpts: [{ text: 'Only this excerpt may leave the vault.', sourceId: 'source_0001' }]
    });
    const execute = vi.fn().mockResolvedValue(undefined);
    const adapter: ProviderAdapter = { execute, handshake: vi.fn() };
    const receipt = await service.confirm(preview.confirmationToken, adapter, 'https://connector.example.invalid/mcp');
    expect(execute).toHaveBeenCalledWith(expect.objectContaining({ payloadHash: preview.payloadHash }));
    expect(receipt.receiptId).toMatch(/^[0-9a-f-]{36}$/);
    expect(JSON.stringify(receipt)).not.toContain('Only this excerpt');
    expect(receipt.sourceIds).toEqual(['source_0001']);
    expect(service.revoke(receipt.payloadHash).revokedAt).toBe('2026-08-12T12:00:00.000Z');
  });

  it('rejects replayed confirmation tokens', async () => {
    const service = new ConsentService();
    const preview = service.prepare({
      provider: 'chatgpt', purpose: 'Summarize', operation: 'read:notes', policyVersion: 'chatgpt-2026-08-12',
      excerpts: [{ text: 'minimal text', sourceId: 'source_0002' }]
    });
    const adapter: ProviderAdapter = { execute: vi.fn().mockResolvedValue(undefined), handshake: vi.fn() };
    await service.confirm(preview.confirmationToken, adapter, 'https://remote.example.invalid/mcp');
    await expect(service.confirm(preview.confirmationToken, adapter, 'https://remote.example.invalid/mcp'))
      .rejects.toThrow('CONSENT_REQUIRED');
  });

  it('rejects expired one-time consent before invoking the provider adapter', async () => {
    let now = new Date('2026-08-12T12:00:00.000Z');
    const service = new ConsentService(() => now);
    const preview = service.prepare({
      provider: 'chatgpt', purpose: 'Summarize', operation: 'read:notes', policyVersion: 'chatgpt-2026-08-12',
      excerpts: [{ text: 'minimal text', sourceId: 'source_0003' }]
    });
    const execute = vi.fn().mockResolvedValue(undefined);
    now = new Date('2026-08-12T12:05:00.000Z');
    await expect(service.confirm(
      preview.confirmationToken,
      { execute, handshake: vi.fn() },
      'https://remote.example.invalid/mcp'
    )).rejects.toThrow('CONSENT_EXPIRED');
    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects excluded fields and non-HTTPS endpoints at the contract boundary', async () => {
    const service = new ConsentService();
    expect(() => service.prepare({
      provider: 'mistral', purpose: 'Answer', operation: 'read:notes', policyVersion: 'mistral-2026-08-12',
      excerpts: [{ text: 'minimal text', sourceId: 'source_0004', relativePath: 'Secret.md' }]
    })).toThrow();
    await expect(inspectProviderConnection({
      contractVersion: CONTRACT_VERSION,
      provider: 'mistral', endpoint: 'http://localhost:3000/mcp',
      expectedScope: ['read:notes', 'consent:once']
    }, { execute: vi.fn(), handshake: vi.fn() })).rejects.toThrow();
  });

  it('keeps a remote endpoint disconnected when its scopes are insufficient', async () => {
    expect(await inspectProviderConnection({
      contractVersion: CONTRACT_VERSION,
      provider: 'chatgpt', endpoint: 'https://other.example.invalid/mcp',
      expectedScope: ['read:notes', 'consent:once']
    }, { execute: vi.fn(), handshake: vi.fn().mockResolvedValue(['read:notes']) })).toMatchObject({
      configured: true,
      connected: false,
      scopes: ['read:notes']
    });
  });

  it('rejects broader scopes, stale policy versions, URL credentials, and concurrent replay', async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    const adapter: ProviderAdapter = {
      execute,
      handshake: vi.fn().mockResolvedValue(['read:notes', 'consent:once', 'write:notes'])
    };
    await expect(inspectProviderConnection({
      contractVersion: CONTRACT_VERSION,
      provider: 'chatgpt', endpoint: 'https://remote.example.invalid/mcp',
      expectedScope: ['read:notes', 'consent:once']
    }, adapter)).resolves.toMatchObject({ connected: false, scopes: ['read:notes', 'consent:once', 'write:notes'] });
    await expect(inspectProviderConnection({
      contractVersion: CONTRACT_VERSION,
      provider: 'chatgpt', endpoint: 'https://user:secret@remote.example.invalid/mcp',
      expectedScope: ['read:notes', 'consent:once']
    }, adapter)).rejects.toThrow();

    const service = new ConsentService();
    expect(() => service.prepare({
      provider: 'chatgpt', purpose: 'Answer', operation: 'read:notes', policyVersion: 'stale-policy',
      excerpts: [{ text: 'minimal text', sourceId: 'source_0006' }]
    })).toThrow('CONSENT_EXPIRED');
    const preview = service.prepare({
      provider: 'chatgpt', purpose: 'Answer', operation: 'read:notes', policyVersion: 'chatgpt-2026-08-12',
      excerpts: [{ text: 'minimal text', sourceId: 'source_0006' }]
    });
    const results = await Promise.allSettled([
      service.confirm(preview.confirmationToken, adapter, 'https://remote.example.invalid/mcp'),
      service.confirm(preview.confirmationToken, adapter, 'https://remote.example.invalid/mcp')
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('uses a real MCP manifest, scope check, and only the confirmed minimal payload', async () => {
    const request = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ jsonrpc: '2.0', result: { capabilities: {} } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ jsonrpc: '2.0', result: { tools: [{ name: 'second_brain_transfer_once' }] } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ jsonrpc: '2.0', result: { scopes: ['read:notes', 'consent:once'] } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ jsonrpc: '2.0', result: { content: [] } }), { status: 200 }));
    const adapter = new RemoteMcpProviderAdapter(request);
    const response = await inspectProviderConnection({ contractVersion: CONTRACT_VERSION, provider: 'chatgpt', endpoint: 'https://remote.example.invalid/mcp', expectedScope: ['read:notes', 'consent:once'] }, adapter);
    expect(response.connected).toBe(true);
    await adapter.execute({ provider: 'chatgpt', endpoint: response.endpoint, purpose: 'Answer', operation: 'read:notes', excerpts: [{ text: 'confirmed text', sourceId: 'source_0005' }], payloadHash: 'a'.repeat(64) });
    const executeCall = request.mock.calls[3];
    expect(executeCall).toBeDefined();
    if (!executeCall) throw new Error('Expected the confirmed one-time transfer request.');
    expect(JSON.parse((executeCall[1] as RequestInit).body as string)).toMatchObject({ method: 'tools/call', params: { arguments: { excerpts: [{ text: 'confirmed text', sourceId: 'source_0005' }] } } });
  });
});
