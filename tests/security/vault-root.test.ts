// Beschreibung: Prüft Vault-Validierung, Traversal- und Fremdpfad-Schutz.
// Artefakte:    US-000011; ADR-000004
// Agent:        BE — 2026-07-30
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  resolveInsideVault,
  validateVaultRoot,
  VaultScopeError
} from '../../apps/sidecar/src/policy/vault-root.js';

async function createVault(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'second-brain-vault-'));
  await mkdir(join(root, '.obsidian'));
  await writeFile(join(root, 'note.md'), '# Safe');
  return root;
}

describe('vault root policy', () => {
  it('akzeptiert einen lesbaren Obsidian-Vault', async () => {
    const root = await createVault();
    await expect(validateVaultRoot(root)).resolves.toBe(root);
  });

  it('lehnt einen Ordner ohne .obsidian ab', async () => {
    const root = await mkdtemp(join(tmpdir(), 'second-brain-invalid-'));
    await expect(validateVaultRoot(root)).rejects.toBeInstanceOf(VaultScopeError);
  });

  it('lehnt Dateien und eine .obsidian-Datei als Vault ab', async () => {
    const root = await mkdtemp(join(tmpdir(), 'second-brain-invalid-shape-'));
    const plainFile = join(root, 'plain.txt');
    await writeFile(plainFile, 'not a vault');
    await expect(validateVaultRoot(plainFile)).rejects.toBeInstanceOf(VaultScopeError);

    await writeFile(join(root, '.obsidian'), 'not a directory');
    await expect(validateVaultRoot(root)).rejects.toBeInstanceOf(VaultScopeError);
  });

  it('löst eine bestehende Datei innerhalb des Vaults auf', async () => {
    const root = await createVault();
    await expect(resolveInsideVault(root, 'note.md')).resolves.toBe(join(root, 'note.md'));
  });

  it('normalisiert einen nicht vorhandenen Zielpfad als Scope-Fehler', async () => {
    const root = await createVault();
    await expect(resolveInsideVault(root, 'missing.md')).rejects.toBeInstanceOf(VaultScopeError);
  });

  it('blockiert absolute Fremdpfade und Traversal', async () => {
    const root = await createVault();
    const outside = await mkdtemp(join(tmpdir(), 'second-brain-outside-'));
    const outsideFile = join(outside, 'secret.md');
    await writeFile(outsideFile, 'not exposed');
    const parentOutsideFile = join(dirname(root), `${basename(root)}-outside.md`);
    await writeFile(parentOutsideFile, 'not exposed');

    await expect(resolveInsideVault(root, outsideFile)).rejects.toBeInstanceOf(VaultScopeError);
    await expect(
      resolveInsideVault(root, join('..', basename(parentOutsideFile)))
    ).rejects.toBeInstanceOf(VaultScopeError);
  });
});
