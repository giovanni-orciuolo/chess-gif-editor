import { Timeline, type Timing } from '../animation/timeline';
import type { Game, Ply } from '../game/parseGame';

export type Sound = 'move' | 'capture' | 'castle' | 'promote' | 'check' | 'gameEnd';

export interface SoundCue {
  atMs: number;
  sound: Sound;
}

export function soundCues(game: Game, timing: Timing): SoundCue[] {
  const timeline = new Timeline(game.plies.length, timing);
  return game.plies.flatMap((ply, index) => {
    const atMs = timeline.landsAtMs(index);
    const cues: SoundCue[] = [{ atMs, sound: soundOf(ply) }];
    if (ply.san.endsWith('#')) cues.push({ atMs, sound: 'gameEnd' });
    return cues;
  });
}

function soundOf(ply: Ply): Sound {
  if (/[+#]$/.test(ply.san)) return 'check';
  if (ply.promotion) return 'promote';
  if (ply.rook) return 'castle';
  if (ply.captured) return 'capture';
  return 'move';
}
