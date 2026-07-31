import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { LocalIndex } from '../apps/sidecar/src/indexing/sqlite-index.js';

const root = await mkdtemp(join(tmpdir(), 'second-brain-perf-'));
const content = `${'#'.repeat(4095)}\n`;

try {
  await Promise.all(
    Array.from({ length: 500 }, (_, index) =>
      writeFile(join(root, `note-${String(index).padStart(3, '0')}.md`), content)
    )
  );
  const hashManifest = async () =>
    Promise.all(
      Array.from({ length: 500 }, async (_, index) =>
        createHash('sha256')
          .update(await readFile(join(root, `note-${String(index).padStart(3, '0')}.md`)))
          .digest('hex')
      )
    );
  const before = await hashManifest();
  const localIndex = new LocalIndex(':memory:');

  const measure = async (operation: () => Promise<unknown>) => {
    const started = performance.now();
    const result = await operation();
    return { durationMs: Number((performance.now() - started).toFixed(2)), result };
  };

  const initial = await measure(() => localIndex.synchronize(root));
  await writeFile(join(root, 'note-250.md'), `${content.slice(0, -2)}changed\n`);
  const delta = await measure(() => localIndex.synchronize(root));
  const noop = await measure(() => localIndex.synchronize(root));
  const beforeRebuild = await hashManifest();
  const rebuild = await measure(() => localIndex.rebuild(root));
  const afterRebuild = await hashManifest();

  localIndex.close();
  console.log(
    JSON.stringify({
      initial,
      delta,
      noop,
      rebuild,
      initialHashesUnchanged: before.every((hash, index) =>
        index === 250 ? true : hash === beforeRebuild[index]
      ),
      rebuildHashesUnchanged: beforeRebuild.every((hash, index) => hash === afterRebuild[index]),
      peakRssBytes: process.resourceUsage().maxRSS * 1024
    })
  );
} finally {
  await rm(root, { recursive: true, force: true });
}
