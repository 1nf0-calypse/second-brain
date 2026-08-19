// Beschreibung: Single-flight Polling-Lifecycle fuer die Pending-Review-Summary.
// Artefakte:    US-000017; UX-000004; ADR-000007
// Agent:        FE — 2026-08-15
import type { PendingCompilationSummary } from '@second-brain/contracts';

export interface PollScheduler {
  set(callback: () => void, delay: number): number;
  clear(handle: number): void;
  isHidden(): boolean;
}

const browserScheduler: PollScheduler = {
  set: (callback, delay) => window.setTimeout(callback, delay),
  clear: (handle) => window.clearTimeout(handle),
  isHidden: () => document.hidden
};

/** Owns one request and one timer at a time; stop permanently prevents rescheduling. */
// Implementiert: US-000017
export class PendingReviewPoller {
  private timer: number | null = null;
  private inFlight = false;
  private stopped = true;

  public constructor(
    private readonly read: () => Promise<PendingCompilationSummary>,
    private readonly receive: (summary: PendingCompilationSummary) => void | Promise<void>,
    private readonly fail: (error: unknown) => void,
    private readonly scheduler: PollScheduler = browserScheduler
  ) {}

  public start(): void { this.stopped = false; this.schedule(0); }
  public refreshNow(): void { if (!this.stopped) this.schedule(0); }
  public stop(): void {
    this.stopped = true;
    if (this.timer !== null) this.scheduler.clear(this.timer);
    this.timer = null;
  }

  private schedule(delay: number): void {
    if (this.timer !== null) this.scheduler.clear(this.timer);
    this.timer = this.scheduler.set(() => { void this.tick(); }, delay);
  }

  private async tick(): Promise<void> {
    if (this.stopped || this.inFlight) return;
    this.inFlight = true;
    try { await this.receive(await this.read()); }
    catch (error: unknown) { this.fail(error); }
    finally {
      this.inFlight = false;
      if (!this.stopped) this.schedule(this.scheduler.isHidden() ? 15_000 : 2_000);
    }
  }
}
