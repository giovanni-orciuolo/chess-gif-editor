import { describe, expect, it } from 'vitest';
import { excerpt } from './excerpt';
import { parseGame } from './parseGame';

const game = parseGame('1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0');

describe('excerpt', () => {
  it('keeps plies 3 to 5 and starts from the position before ply 3', () => {
    const part = excerpt(game, 3, 5);

    expect(part.plies.map((ply) => ply.san)).toEqual(['Bc4', 'Nc6', 'Qh5']);
    expect(part.initial.get('e4')).toBe('wp');
  });

  it('clamps a range that runs past the end of the game', () => {
    expect(excerpt(game, 6, 99).plies.map((ply) => ply.san)).toEqual(['Nf6', 'Qxf7#']);
  });
});
