export interface Timing {
  moveMs: number;
  pauseMs: number;
  startHoldMs: number;
  endHoldMs: number;
}

export interface Frame {
  ply: number;
  progress: number;
}

export class Timeline {
  constructor(
    private readonly plyCount: number,
    private readonly timing: Timing,
  ) {}

  get durationMs(): number {
    const { moveMs, pauseMs, startHoldMs, endHoldMs } = this.timing;
    const pauses = Math.max(0, this.plyCount - 1);
    return startHoldMs + this.plyCount * moveMs + pauses * pauseMs + endHoldMs;
  }

  landsAtMs(ply: number): number {
    const { moveMs, pauseMs, startHoldMs } = this.timing;
    return startHoldMs + ply * (moveMs + pauseMs) + moveMs;
  }

  frameAt(ms: number): Frame {
    const { moveMs, pauseMs, startHoldMs } = this.timing;
    const elapsed = ms - startHoldMs;
    if (elapsed <= 0 || this.plyCount === 0) return { ply: 0, progress: 0 };
    const ply = Math.floor(elapsed / (moveMs + pauseMs));
    if (ply >= this.plyCount) return { ply: this.plyCount - 1, progress: 1 };
    const intoPly = elapsed - ply * (moveMs + pauseMs);
    return { ply, progress: Math.min(1, intoPly / moveMs) };
  }
}
