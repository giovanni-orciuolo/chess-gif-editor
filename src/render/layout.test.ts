import { describe, expect, it } from 'vitest';
import { Layout } from './layout';

describe('Layout', () => {
  it('is exactly the board when player bars are off', () => {
    const layout = new Layout(480, false);

    expect([layout.width, layout.height, layout.boardTop]).toEqual([480, 480, 0]);
  });

  it('adds a bar above and below the board for the players', () => {
    const layout = new Layout(480, true);

    expect(layout.barHeight).toBe(40);
    expect([layout.height, layout.boardTop]).toEqual([560, 40]);
  });

  it('rounds the board to whole squares with an even side so video encoders accept it', () => {
    const layout = new Layout(501, true);

    expect(layout.square).toBe(62);
    expect(layout.width).toBe(496);
    expect(layout.height % 2).toBe(0);
  });
});
