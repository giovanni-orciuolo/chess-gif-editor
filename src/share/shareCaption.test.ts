import { describe, expect, it } from 'vitest';
import { shareCaption } from './shareCaption';

const players = { white: { name: 'alice', rating: '1500' }, black: { name: 'bob', rating: '1450' } };

describe('shareCaption', () => {
  it('names both players and credits the site', () => {
    expect(shareCaption(players)).toBe('alice vs bob, animated with Chess GIF Editor: https://chess.orciuolo.it #chess');
  });
});
