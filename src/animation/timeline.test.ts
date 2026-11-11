import { describe, expect, it } from 'vitest';
import { Timeline } from './timeline';

const timing = { moveMs: 400, pauseMs: 600, startHoldMs: 1000, endHoldMs: 2000 };

describe('Timeline', () => {
  it('lasts start hold + moves + pauses between them + end hold', () => {
    expect(new Timeline(3, timing).durationMs).toBe(1000 + 3 * 400 + 2 * 600 + 2000);
  });

  it('shows the first ply unplayed during the start hold', () => {
    expect(new Timeline(3, timing).frameAt(500)).toEqual({ ply: 0, progress: 0 });
  });

  it('is halfway through the first ply 200 ms after the start hold', () => {
    expect(new Timeline(3, timing).frameAt(1200)).toEqual({ ply: 0, progress: 0.5 });
  });

  it('holds the finished first ply during the pause after it', () => {
    expect(new Timeline(3, timing).frameAt(1700)).toEqual({ ply: 0, progress: 1 });
  });

  it('starts the second ply once the first pause ends', () => {
    expect(new Timeline(3, timing).frameAt(2100)).toEqual({ ply: 1, progress: 0.25 });
  });

  it('holds the last ply until the end and beyond', () => {
    expect(new Timeline(3, timing).frameAt(99_999)).toEqual({ ply: 2, progress: 1 });
  });

  it('lasts only the holds for a game without moves', () => {
    expect(new Timeline(0, timing).durationMs).toBe(3000);
  });
});
