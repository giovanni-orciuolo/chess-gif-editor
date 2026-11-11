import type { Game } from './parseGame';

export function excerpt(game: Game, firstPly: number, lastPly: number): Game {
  const plies = game.plies.slice(firstPly - 1, lastPly);
  return { ...game, plies, initial: plies[0]?.before ?? game.initial };
}
