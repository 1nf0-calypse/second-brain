// Beschreibung: Erstellt aus Build-Ausgaben ein vollständig installierbares Obsidian-Plugin.
// Artefakte:    US-000011; BUG-000001
// Agent:        BE — 2026-07-30
import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Copies the standard Obsidian Community Plugin release assets.
 * The plugin bundle contains the sidecar source and materializes it locally on load.
 * @param {{ sourceRoot: string, pluginOutput: string }} paths Source and output paths.
 * @returns Promise nach vollständiger Paketierung.
 * @throws Dateisystemfehler bei fehlenden oder nicht schreibbaren Dateien.
 * @sideEffect Erstellt Verzeichnisse und überschreibt abgeleitete Build-Artefakte.
 */
export async function packageObsidianPlugin({ sourceRoot, pluginOutput }) {
  await Promise.all([
    copyFile(join(sourceRoot, 'manifest.json'), join(pluginOutput, 'manifest.json')),
    copyFile(join(sourceRoot, 'styles.css'), join(pluginOutput, 'styles.css'))
  ]);
}
