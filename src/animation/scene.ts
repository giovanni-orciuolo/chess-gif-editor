import type { Game, PieceMove, Ply } from '../game/parseGame';
import { squareCoordinates, type PieceCode, type Placement, type Square } from '../game/placement';
import type { Frame } from './timeline';

export type Easing = (progress: number) => number;

export interface Sprite {
  code: PieceCode;
  file: number;
  rank: number;
  opacity: number;
}

export interface Scene {
  sprites: Sprite[];
  highlight?: { from: Square; to: Square };
  caption: string;
  mover?: 'w' | 'b';
}

export function sceneAt(game: Game, frame: Frame, ease: Easing): Scene {
  const ply = game.plies[frame.ply];
  if (!ply) return { sprites: staticSprites(game.initial, new Set()), caption: '' };
  if (frame.progress === 0) return restingBefore(game, frame.ply);
  return { ...animatedSprites(ply, ease(frame.progress), frame.progress), ...labelled(ply) };
}

function restingBefore(game: Game, plyIndex: number): Scene {
  const ply = game.plies[plyIndex];
  const previous = game.plies[plyIndex - 1];
  const sprites = staticSprites(ply.before, new Set());
  if (!previous) return { sprites, caption: '' };
  return { sprites, ...labelled(previous) };
}

function animatedSprites(ply: Ply, eased: number, progress: number): Pick<Scene, 'sprites'> {
  const moving = [ply.piece, ply.rook].filter((move): move is PieceMove => Boolean(move));
  const hidden = new Set<Square>(moving.map((move) => move.from));
  if (ply.captured) hidden.add(ply.captured.square);
  const sprites = staticSprites(ply.before, hidden);
  if (ply.captured) sprites.push({ code: ply.captured.code, ...squareCoordinates(ply.captured.square), opacity: 1 - eased });
  const landedCode = progress >= 1 && ply.promotion ? ply.promotion : ply.piece.code;
  if (ply.rook) sprites.push(slide(ply.rook, eased));
  sprites.push({ ...slide(ply.piece, eased), code: landedCode });
  return { sprites };
}

function labelled(ply: Ply): Pick<Scene, 'highlight' | 'caption' | 'mover'> {
  const mover = ply.piece.code[0] as 'w' | 'b';
  const dots = mover === 'w' ? '.' : '...';
  const caption = `${ply.moveNumber}${dots} ${ply.san}`;
  return { highlight: { from: ply.piece.from, to: ply.piece.to }, caption, mover };
}

function staticSprites(placement: Placement, hidden: Set<Square>): Sprite[] {
  return [...placement]
    .filter(([square]) => !hidden.has(square))
    .map(([square, code]) => ({ code, ...squareCoordinates(square), opacity: 1 }));
}

function slide(move: PieceMove, eased: number): Sprite {
  const from = squareCoordinates(move.from);
  const to = squareCoordinates(move.to);
  return {
    code: move.code,
    file: from.file + (to.file - from.file) * eased,
    rank: from.rank + (to.rank - from.rank) * eased,
    opacity: 1,
  };
}
