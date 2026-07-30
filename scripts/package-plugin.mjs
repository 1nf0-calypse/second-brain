// Beschreibung: Erstellt aus Build-Ausgaben ein vollständig installierbares Obsidian-Plugin.
// Artefakte:    US-000011; BUG-000001
// Agent:        BE — 2026-07-30
import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Kopiert Metadaten, Styles und Sidecar in das installierbare Plugin-Verzeichnis.
 * @param {{ sourceRoot: string, pluginOutput: string, sidecarBundle: string }} paths Quell-
 * und Zielpfade des Paket-Builds.
 * @returns Promise nach vollständiger Paketierung.
 * @throws Dateisystemfehler bei fehlenden oder nicht schreibbaren Dateien.
 * @sideEffect Erstellt Verzeichnisse und überschreibt abgeleitete Build-Artefakte.
 */
export async function packageObsidianPlugin({ sourceRoot, pluginOutput, sidecarBundle }) {
  const sidecarOutput = join(pluginOutput, 'sidecar');
  await mkdir(sidecarOutput, { recursive: true });
  await Promise.all([
    copyFile(join(sourceRoot, 'manifest.json'), join(pluginOutput, 'manifest.json')),
    copyFile(join(sourceRoot, 'styles.css'), join(pluginOutput, 'styles.css')),
    copyFile(sidecarBundle, join(sidecarOutput, 'main.js'))
  ]);
}
