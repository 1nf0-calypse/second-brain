// Beschreibung: Prüft den vollständigen installierbaren Inhalt des Obsidian-Plugin-Pakets.
// Artefakte:    US-000011; BUG-000001
// Agent:        BE — 2026-07-30
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { packageObsidianPlugin } from '../../scripts/package-plugin.mjs';

describe('Obsidian plugin package', () => {
  it('hält das Community-Manifest und die Build-Quelle synchron', async () => {
    const rootManifest = JSON.parse(await readFile('manifest.json', 'utf8')) as unknown;
    const sourceManifest = JSON.parse(
      await readFile('apps/obsidian-plugin/manifest.json', 'utf8')
    ) as unknown;
    expect(sourceManifest).toEqual(rootManifest);
  });

  it('contains the standard Obsidian Community Plugin release assets', async () => {
    const root = await mkdtemp(join(tmpdir(), 'second-brain-package-'));
    const sourceRoot = join(root, 'source');
    const pluginOutput = join(root, 'dist', 'obsidian-plugin');
    await mkdir(sourceRoot, { recursive: true });
    await mkdir(pluginOutput, { recursive: true });
    await Promise.all([
      writeFile(join(sourceRoot, 'manifest.json'), '{"id":"second-brain-mcp"}'),
      writeFile(join(sourceRoot, 'styles.css'), '.second-brain {}'),
      writeFile(join(pluginOutput, 'main.js'), 'plugin-with-embedded-sidecar')
    ]);

    await packageObsidianPlugin({ sourceRoot, pluginOutput });

    await expect(readFile(join(pluginOutput, 'manifest.json'), 'utf8')).resolves.toContain(
      'second-brain-mcp'
    );
    await expect(readFile(join(pluginOutput, 'styles.css'), 'utf8')).resolves.toContain(
      '.second-brain'
    );
    await expect(readFile(join(pluginOutput, 'main.js'), 'utf8')).resolves.toBe(
      'plugin-with-embedded-sidecar'
    );
  });
});
