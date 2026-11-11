import { Chess, type Move } from 'chess.js';
import { placementFromFen, type PieceCode, type Placement, type Square } from './placement';

export interface Player {
  name: string;
  rating: string;
}

export interface PieceMove {
  from: Square;
  to: Square;
  code: PieceCode;
}

export interface Capture {
  square: Square;
  code: PieceCode;
}

export interface Ply {
  san: string;
  moveNumber: number;
  piece: PieceMove;
  rook?: PieceMove;
  captured?: Capture;
  promotion?: PieceCode;
  before: Placement;
  after: Placement;
}

export interface Game {
  players: { white: Player; black: Player };
  result: string;
  initial: Placement;
  plies: Ply[];
}

export function parseGame(pgn: string): Game {
  const chess = loadPgn(pgn);
  const headers = chess.getHeaders();
  const moves = chess.history({ verbose: true });
  return {
    players: {
      white: { name: headers.White ?? 'White', rating: headers.WhiteElo ?? '' },
      black: { name: headers.Black ?? 'Black', rating: headers.BlackElo ?? '' },
    },
    result: headers.Result ?? '*',
    initial: placementFromFen(moves[0]?.before ?? chess.fen()),
    plies: moves.map(toPly),
  };
}

function loadPgn(pgn: string): Chess {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn.trim());
  } catch (error) {
    throw new Error(`This PGN cannot be read: ${(error as Error).message}`);
  }
  return chess;
}

function toPly(move: Move): Ply {
  const before = placementFromFen(move.before);
  return {
    san: move.san,
    moveNumber: Number(move.before.split(' ')[5]),
    piece: { from: move.from, to: move.to, code: `${move.color}${move.piece}` },
    rook: castlingRook(move),
    captured: capture(move, before),
    promotion: move.promotion ? `${move.color}${move.promotion}` : undefined,
    before,
    after: placementFromFen(move.after),
  };
}

function castlingRook(move: Move): PieceMove | undefined {
  if (!move.isKingsideCastle() && !move.isQueensideCastle()) return undefined;
  const rank = move.from[1];
  const [fromFile, toFile] = move.isKingsideCastle() ? ['h', 'f'] : ['a', 'd'];
  return { from: `${fromFile}${rank}` as Square, to: `${toFile}${rank}` as Square, code: `${move.color}r` };
}

function capture(move: Move, before: Placement): Capture | undefined {
  if (!move.captured) return undefined;
  const square = move.isEnPassant() ? (`${move.to[0]}${move.from[1]}` as Square) : move.to;
  return { square, code: before.get(square)! };
}
