// Beschreibung: Fake-Timer-Nachweis fuer Intervalle, Single-flight und Unload-Schutz.
// Artefakte:    US-000017; UX-000004
// Agent:        FE — 2026-08-15
import { describe, expect, it, vi } from 'vitest';
import { PendingReviewPoller, type PollScheduler } from '../../apps/obsidian-plugin/src/ui/pending-review-poller.js';

const summary = { count: 1, revision: 1, oldestExpiresAt: '2026-08-15T11:00:00.000Z' } as const;

function scheduler(hidden: () => boolean): PollScheduler {
  return { set: (callback, delay) => Number(setTimeout(callback, delay)), clear: (handle) => clearTimeout(handle), isHidden: hidden };
}

describe('PendingReviewPoller', () => {
  it('uses 2 seconds while visible and 15 seconds while hidden', async () => {
    vi.useFakeTimers();
    let hidden = false;
    const read = vi.fn().mockResolvedValue(summary);
    const poller = new PendingReviewPoller(read, vi.fn(), vi.fn(), scheduler(() => hidden));
    poller.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(read).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1_999);
    expect(read).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(read).toHaveBeenCalledTimes(2);
    hidden = true;
    await vi.advanceTimersByTimeAsync(15_000);
    expect(read).toHaveBeenCalledTimes(3);
    poller.stop();
    vi.useRealTimers();
  });

  it('never overlaps requests and leaves no timer after stop', async () => {
    vi.useFakeTimers();
    let resolveRead: ((value: typeof summary) => void) | null = null;
    const read = vi.fn(() => new Promise<typeof summary>((resolve) => { resolveRead = resolve; }));
    const poller = new PendingReviewPoller(read, vi.fn(), vi.fn(), scheduler(() => false));
    poller.start();
    await vi.advanceTimersByTimeAsync(0);
    poller.refreshNow();
    await vi.advanceTimersByTimeAsync(0);
    expect(read).toHaveBeenCalledTimes(1);
    poller.stop();
    (resolveRead as ((value: typeof summary) => void) | null)?.(summary);
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(20_000);
    expect(read).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
