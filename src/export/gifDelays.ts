export class GifDelays {
  private elapsedMs = 0;
  private emittedCs = 0;

  next(durationMs: number): number {
    this.elapsedMs += durationMs;
    const delay = Math.round(this.elapsedMs / 10) - this.emittedCs;
    this.emittedCs += delay;
    return delay;
  }
}
