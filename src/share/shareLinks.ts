import type { Players } from '../render/painter';

export const siteUrl = 'https://chess.orciuolo.it';

export interface ShareLink {
  name: string;
  href: string;
}

export function shareCaption(players: Players): string {
  return `${title(players)}: ${siteUrl} #chess`;
}

export function shareLinks(players: Players): ShareLink[] {
  const caption = shareCaption(players);
  const link = (name: string, base: string, params: Record<string, string>) => ({
    name,
    href: `${base}?${new URLSearchParams(params)}`,
  });
  return [
    link('X', 'https://x.com/intent/post', { text: caption }),
    link('Facebook', 'https://www.facebook.com/sharer/sharer.php', { u: siteUrl }),
    link('Reddit', 'https://www.reddit.com/submit', { url: siteUrl, title: title(players) }),
    link('WhatsApp', 'https://wa.me/', { text: caption }),
    link('Telegram', 'https://t.me/share/url', { url: siteUrl, text: title(players) }),
    link('Bluesky', 'https://bsky.app/intent/compose', { text: caption }),
    link('LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/', { url: siteUrl }),
  ];
}

function title(players: Players): string {
  return `${players.white.name} vs ${players.black.name}, animated with Chess GIF Editor`;
}
