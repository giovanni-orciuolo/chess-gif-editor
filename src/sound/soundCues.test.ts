import { describe, expect, it } from 'vitest';
import { parseGame } from '../game/parseGame';
import { soundCues } from './soundCues';

const timing = { moveMs: 300, pauseMs: 700, startHoldMs: 1000, endHoldMs: 2000 };

describe('soundCues', () => {
  it('plays a move sound when the first pawn lands', () => {
    const cues = soundCues(parseGame('1. e4 *'), timing);

    expect(cues).toEqual([{ atMs: 1300, sound: 'move' }]);
  });

  it('lands each next ply one move and one pause later', () => {
    const cues = soundCues(parseGame('1. e4 e5 *'), timing);

    expect(cues.map((cue) => cue.atMs)).toEqual([1300, 2300]);
  });

  it('plays a capture sound for a capture', () => {
    const cues = soundCues(parseGame('1. e4 d5 2. exd5 *'), timing);

    expect(cues[2].sound).toBe('capture');
  });

  it('plays a castle sound for castling', () => {
    const cues = soundCues(parseGame('1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O *'), timing);

    expect(cues[6].sound).toBe('castle');
  });

  it('plays a promotion sound when a pawn promotes', () => {
    const cues = soundCues(parseGame('[FEN "8/P6k/8/8/8/8/8/K7 w - - 0 1"]\n[SetUp "1"]\n\n1. a8=Q *'), timing);

    expect(cues[0].sound).toBe('promote');
  });

  it('plays a check sound when the move gives check', () => {
    const cues = soundCues(parseGame('1. e4 f5 2. Qh5+ *'), timing);

    expect(cues[2].sound).toBe('check');
  });

  it('adds a game-end sound right after checkmate', () => {
    const cues = soundCues(parseGame('1. f3 e5 2. g4 Qh4# 0-1'), timing);

    expect(cues.slice(-2)).toEqual([
      { atMs: 4300, sound: 'check' },
      { atMs: 4300, sound: 'gameEnd' },
    ]);
  });
});
