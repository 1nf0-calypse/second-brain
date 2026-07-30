// Beschreibung: Bündelt Sidecar und Obsidian-Plugin reproduzierbar mit esbuild.
// Artefakte:    US-000011; ADR-000001
// Agent:        BE — 2026-07-30
import { build, context } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { packageObsidianPlugin } from './package-plugin.mjs';

const watch = process.argv.includes('--watch');
const pluginOutput = 'dist/obsidian-plugin';
const sidecarBundle = 'dist/sidecar/main.js';
const sidecarBuild = {
  entryPoints: ['apps/sidecar/src/bootstrap/main.ts'],
  outfile: sidecarBundle,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node24',
  external: ['node:sqlite']
};

const pluginBuild = (sidecarSource) => ({
    entryPoints: ['apps/obsidian-plugin/src/main.ts'],
    outfile: 'dist/obsidian-plugin/main.js',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'es2022',
    external: ['obsidian', 'node:child_process', 'node:fs/promises', 'node:path'],
    define: {
      __SECOND_BRAIN_SIDECAR_SOURCE__: JSON.stringify(sidecarSource)
    }
  });

if (watch) {
  await build(sidecarBuild);
  const sidecarSource = await readFile(sidecarBundle, 'utf8');
  const pluginContext = await context(pluginBuild(sidecarSource));
  await pluginContext.watch();
} else {
  await build(sidecarBuild);
  const sidecarSource = await readFile(sidecarBundle, 'utf8');
  await build(pluginBuild(sidecarSource));
  await packageObsidianPlugin({
    sourceRoot: 'apps/obsidian-plugin',
    pluginOutput
  });
}
