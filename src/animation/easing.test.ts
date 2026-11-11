import { describe, expect, it } from 'vitest';
import { easings } from './easing';

describe('easings', () => {
  it.each(Object.keys(easings))('%s starts at 0 and ends at 1', (name) => {
    const ease = easings[name as keyof typeof easings];
    expect([ease(0), ease(1)]).toEqual([0, 1]);
  });

  it('ease-in-out passes the middle at the middle', () => {
    expect(easings.easeInOut(0.5)).toBeCloseTo(0.5);
  });

  it('ease-out is ahead of linear early on', () => {
    expect(easings.easeOut(0.25)).toBeGreaterThan(0.25);
  });
});
