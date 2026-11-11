import { describe, expect, it } from 'vitest';
import { GifDelays } from './gifDelays';

describe('GifDelays', () => {
  it('turns three 33.3 ms frames into 3 + 4 + 3 centiseconds so the total stays 100 ms', () => {
    const delays = new GifDelays();

    expect([1, 2, 3].map(() => delays.next(100 / 3))).toEqual([3, 4, 3]);
  });

  it('keeps a long hold of 2 seconds as 200 centiseconds', () => {
    expect(new GifDelays().next(2000)).toBe(200);
  });
});
