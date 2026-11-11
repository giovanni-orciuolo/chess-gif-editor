import { describe, expect, it } from 'vitest';
import { parseGame } from './parseGame';

const chessComPgn = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.11.10"]
[White "alice"]
[Black "bob"]
[Result "1-0"]
[WhiteElo "1500"]
[BlackElo "1450"]
[TimeControl "180"]
[Termination "alice won by checkmate"]

1. e4 {[%clk 0:02:59.9]} 1... e5 {[%clk 0:02:58.1]} 2. Bc4 {[%clk 0:02:57]} 2... Nc6 {[%clk 0:02:55]}
3. Qh5 {[%clk 0:02:50]} 3... Nf6 {[%clk 0:02:40]} 4. Qxf7# {[%clk 0:02:45]} 1-0`;

describe('parseGame', () => {
  it('reads the players and result from a Chess.com export', () => {
    const game = parseGame(chessComPgn);

    expect(game.players).toEqual({
      white: { name: 'alice', rating: '1500' },
      black: { name: 'bob', rating: '1450' },
    });
    expect(game.result).toBe('1-0');
  });

  it('turns the scholar\'s mate into seven plies ending with a capture on f7', () => {
    const game = parseGame(chessComPgn);

    expect(game.plies).toHaveLength(7);
    const mate = game.plies[6];
    expect(mate.san).toBe('Qxf7#');
    expect(mate.piece).toEqual({ from: 'h5', to: 'f7', code: 'wq' });
    expect(mate.captured).toEqual({ square: 'f7', code: 'bp' });
  });

  it('starts from the standard initial position', () => {
    const game = parseGame(chessComPgn);

    expect(game.plies[0].before.get('e2')).toBe('wp');
    expect(game.plies[0].after.get('e4')).toBe('wp');
    expect(game.plies[0].after.has('e2')).toBe(false);
  });

  it('moves the rook as well when a king castles', () => {
    const game = parseGame('1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O *');

    expect(game.plies[6].rook).toEqual({ from: 'h1', to: 'f1', code: 'wr' });
  });

  it('captures the passed pawn on its own square for en passant', () => {
    const game = parseGame('1. e4 a6 2. e5 d5 3. exd6 *');

    expect(game.plies[4].captured).toEqual({ square: 'd5', code: 'bp' });
  });

  it('records the promoted piece', () => {
    const game = parseGame('[FEN "8/P6k/8/8/8/8/8/K7 w - - 0 1"]\n[SetUp "1"]\n\n1. a8=Q *');

    expect(game.plies[0].promotion).toBe('wq');
    expect(game.plies[0].after.get('a8')).toBe('wq');
  });

  it('rejects text that is not a valid game', () => {
    expect(() => parseGame('1. e4 e4')).toThrow(/PGN/);
  });
});
