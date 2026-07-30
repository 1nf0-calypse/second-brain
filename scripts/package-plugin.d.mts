// Beschreibung: Typvertrag für die Obsidian-Plugin-Paketierungsstufe.
// Artefakte:    US-000011; BUG-000001
// Agent:        BE — 2026-07-30
export interface PluginPackagePaths {
  readonly sourceRoot: string;
  readonly pluginOutput: string;
  readonly sidecarBundle: string;
}

/**
 * Erstellt ein installierbares Obsidian-Plugin-Paket.
 * @param paths Quell- und Zielpfade des Paket-Builds.
 * @returns Promise nach vollständiger Paketierung.
 * @throws Dateisystemfehler bei fehlenden oder nicht schreibbaren Dateien.
 */
export function packageObsidianPlugin(paths: PluginPackagePaths): Promise<void>;
