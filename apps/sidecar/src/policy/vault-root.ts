// Beschreibung: Erzwingt den freigegebenen Vault-Root für jeden Dateizugriff.
// Artefakte:    US-000011; ADR-000004
// Agent:        BE — 2026-07-30
import { lstat, realpath } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';

export class VaultScopeError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'VaultScopeError';
  }
}

/**
 * Prüft, dass ein Vault existiert, lesbar ist und eine Obsidian-Konfiguration enthält.
 * @param candidate Vom Nutzer ausgewählter Verzeichnispfad.
 * @returns Kanonischer Vault-Root.
 * @throws VaultScopeError bei ungültigem oder nicht lesbarem Vault.
 */
export async function validateVaultRoot(candidate: string): Promise<string> {
  try {
    const canonical = await realpath(resolve(candidate));
    const vaultStat = await lstat(canonical);
    const obsidianStat = await lstat(resolve(canonical, '.obsidian'));
    if (!vaultStat.isDirectory() || !obsidianStat.isDirectory()) {
      throw new VaultScopeError('This folder is not a readable Obsidian vault.');
    }
    return canonical;
  } catch (error: unknown) {
    if (error instanceof VaultScopeError) {
      throw error;
    }
    throw new VaultScopeError('This folder is not a readable Obsidian vault.');
  }
}

/**
 * Löst einen relativen Pfad sicher innerhalb des kanonischen Vault-Roots auf.
 * @param vaultRoot Bereits validierter, kanonischer Vault-Root.
 * @param requestedPath Vom Client angeforderter relativer Pfad.
 * @returns Kanonischer Zielpfad innerhalb des Vaults.
 * @throws VaultScopeError bei absoluten Pfaden, Traversal oder Symlink-Escape.
 */
export async function resolveInsideVault(
  vaultRoot: string,
  requestedPath: string
): Promise<string> {
  if (isAbsolute(requestedPath)) {
    throw new VaultScopeError('This path leaves the vault you approved. Access was blocked.');
  }
  try {
    const candidate = resolve(vaultRoot, requestedPath);
    const canonical = await realpath(candidate);
    const relation = relative(vaultRoot, canonical);
    if (
      relation === '..' ||
      relation.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)
    ) {
      throw new VaultScopeError('This path leaves the vault you approved. Access was blocked.');
    }
    return canonical;
  } catch (error: unknown) {
    if (error instanceof VaultScopeError) {
      throw error;
    }
    throw new VaultScopeError('This path leaves the vault you approved. Access was blocked.');
  }
}
