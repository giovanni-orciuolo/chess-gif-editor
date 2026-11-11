import type { Square } from 'chess.js';

export type { Square };

export type PieceCode = `${'w' | 'b'}${'p' | 'n' | 'b' | 'r' | 'q' | 'k'}`;

export type Placement = ReadonlyMap<Square, PieceCode>;

const files = 'abcdefgh';

export function placementFromFen(fen: string): Placement {
  const placement = new Map<Square, PieceCode>();
  fen.split(' ')[0].split('/').forEach((row, rowIndex) => {
    let file = 0;
    for (const symbol of row) {
      const empty = Number(symbol);
      if (empty) {
        file += empty;
        continue;
      }
      placement.set(`${files[file]}${8 - rowIndex}` as Square, pieceCode(symbol));
      file += 1;
    }
  });
  return placement;
}

function pieceCode(fenSymbol: string): PieceCode {
  const color = fenSymbol === fenSymbol.toUpperCase() ? 'w' : 'b';
  return `${color}${fenSymbol.toLowerCase()}` as PieceCode;
}

export function squareCoordinates(square: Square): { file: number; rank: number } {
  return { file: files.indexOf(square[0]), rank: Number(square[1]) - 1 };
}
