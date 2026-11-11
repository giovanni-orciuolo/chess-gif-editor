import { describe, expect, it } from 'vitest';
import { parseGame } from '../game/parseGame';
import { sceneAt } from './scene';

const linear = (t: number) => t;
const scholarsMate = parseGame('1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0');

describe('sceneAt', () => {
  it('slides the moving piece halfway between its squares at half progress', () => {
    const scene = sceneAt(scholarsMate, { ply: 0, progress: 0.5 }, linear);

    expect(scene.sprites).toContainEqual({ code: 'wp', file: 4, rank: 2, opacity: 1 });
    expect(scene.sprites).toHaveLength(32);
  });

  it('applies the easing to the progress', () => {
    const easeToEnd = () => 1;
    const scene = sceneAt(scholarsMate, { ply: 0, progress: 0.1 }, easeToEnd);

    expect(scene.sprites).toContainEqual({ code: 'wp', file: 4, rank: 3, opacity: 1 });
  });

  it('fades the captured piece as the capturer arrives', () => {
    const scene = sceneAt(scholarsMate, { ply: 6, progress: 0.25 }, linear);

    expect(scene.sprites).toContainEqual({ code: 'bp', file: 5, rank: 6, opacity: 0.75 });
  });

  it('draws the moving piece last so it passes over the others', () => {
    const scene = sceneAt(scholarsMate, { ply: 6, progress: 0.25 }, linear);

    expect(scene.sprites.at(-1)?.code).toBe('wq');
  });

  it('shows the promoted piece once the pawn lands', () => {
    const game = parseGame('[FEN "8/P6k/8/8/8/8/8/K7 w - - 0 1"]\n[SetUp "1"]\n\n1. a8=Q *');

    expect(sceneAt(game, { ply: 0, progress: 0.9 }, linear).sprites.at(-1)?.code).toBe('wp');
    expect(sceneAt(game, { ply: 0, progress: 1 }, linear).sprites.at(-1)?.code).toBe('wq');
  });

  it('slides the rook together with the castling king', () => {
    const game = parseGame('1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O *');
    const scene = sceneAt(game, { ply: 6, progress: 0.5 }, linear);

    expect(scene.sprites).toContainEqual({ code: 'wr', file: 6, rank: 0, opacity: 1 });
  });

  it('highlights the move being played and captions it', () => {
    const scene = sceneAt(scholarsMate, { ply: 3, progress: 0.5 }, linear);

    expect(scene.highlight).toEqual({ from: 'b8', to: 'c6' });
    expect(scene.caption).toBe('2... Nc6');
    expect(scene.mover).toBe('b');
  });

  it('keeps the previous move highlighted until the next one starts', () => {
    const scene = sceneAt(scholarsMate, { ply: 4, progress: 0 }, linear);

    expect(scene.highlight).toEqual({ from: 'b8', to: 'c6' });
    expect(scene.caption).toBe('2... Nc6');
  });

  it('shows the initial position without highlight before the first move', () => {
    const scene = sceneAt(scholarsMate, { ply: 0, progress: 0 }, linear);

    expect(scene.highlight).toBeUndefined();
    expect(scene.caption).toBe('');
  });
});
