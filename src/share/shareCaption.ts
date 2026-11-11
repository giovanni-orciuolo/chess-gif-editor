import type { Players } from '../render/painter';

const siteUrl = 'https://chess.orciuolo.it';

export function shareCaption(players: Players): string {
  return `${players.white.name} vs ${players.black.name}, animated with Chess GIF Editor: ${siteUrl} #chess`;
}
