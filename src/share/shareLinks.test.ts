import { describe, expect, it } from 'vitest';
import { shareCaption, shareLinks } from './shareLinks';

const players = { white: { name: 'alice', rating: '1500' }, black: { name: 'bob', rating: '1450' } };

describe('shareCaption', () => {
  it('names both players and credits the site', () => {
    expect(shareCaption(players)).toBe('alice vs bob, animated with Chess GIF Editor: https://chess.orciuolo.it #chess');
  });
});

describe('shareLinks', () => {
  const links = shareLinks(players);
  const find = (name: string) => new URL(links.find((link) => link.name === name)!.href);

  it('prefills an X post with the caption', () => {
    const url = find('X');

    expect(url.origin + url.pathname).toBe('https://x.com/intent/post');
    expect(url.searchParams.get('text')).toBe(shareCaption(players));
  });

  it('shares the site on Facebook', () => {
    expect(find('Facebook').searchParams.get('u')).toBe('https://chess.orciuolo.it');
  });

  it('submits the site to Reddit with the players as title', () => {
    const url = find('Reddit');

    expect(url.searchParams.get('url')).toBe('https://chess.orciuolo.it');
    expect(url.searchParams.get('title')).toBe('alice vs bob, animated with Chess GIF Editor');
  });

  it('puts the whole caption into a WhatsApp message', () => {
    expect(find('WhatsApp').searchParams.get('text')).toBe(shareCaption(players));
  });

  it('offers Telegram, Bluesky and LinkedIn too', () => {
    expect(links.map((link) => link.name)).toEqual(['X', 'Facebook', 'Reddit', 'WhatsApp', 'Telegram', 'Bluesky', 'LinkedIn']);
  });
});
