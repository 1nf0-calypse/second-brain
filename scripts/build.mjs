// Beschreibung: Bündelt Sidecar und Obsidian-Plugin reproduzierbar mit esbuild.
// Artefakte:    US-000011; ADR-000001
// Agent:        BE — 2026-07-30
import { build, context } from 'esbuild';

const watch = process.argv.includes('--watch');
const builds = [
  {
    entryPoints: ['apps/sidecar/src/bootstrap/main.ts'],
    outfile: 'dist/sidecar/main.js',
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node24',
    external: ['node:sqlite']
  },
  {
    entryPoints: ['apps/obsidian-plugin/src/main.ts'],
    outfile: 'dist/obsidian-plugin/main.js',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'es2022',
    external: ['obsidian', 'node:child_process', 'node:path']
  }
];

if (watch) {
  const contexts = await Promise.all(builds.map((options) => context(options)));
  await Promise.all(contexts.map((buildContext) => buildContext.watch()));
} else {
  await Promise.all(builds.map((options) => build(options)));
}
