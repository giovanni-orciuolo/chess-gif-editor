import type { EasingName } from '../animation/easing';
import type { Timing } from '../animation/timeline';
import type { Look } from '../render/painter';
import type { SoundSet } from '../sound/soundLibrary';
import { boardThemes } from '../render/theme';

export type Format = 'mp4' | 'gif';

export interface Settings {
  size: number;
  look: Look;
  timing: Timing;
  easing: EasingName;
  fps: number;
  playerBars: boolean;
  sound: boolean;
  volume: number;
  soundSet: SoundSet;
  firstPly: number;
  lastPly: number;
  format: Format;
}

export const defaultSettings: Settings = {
  size: 480,
  look: { colors: boardThemes.green, flipped: false, coordinates: true, highlightMove: true, moveLabel: true, ratings: true },
  timing: { moveMs: 300, pauseMs: 700, startHoldMs: 1000, endHoldMs: 3000 },
  easing: 'easeInOut',
  fps: 30,
  playerBars: true,
  sound: true,
  volume: 0.8,
  soundSet: 'sfx',
  firstPly: 1,
  lastPly: 999,
  format: 'mp4',
};

const storageKey = 'chess-gif-editor.settings';

export function loadSettings(): Settings {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as Partial<Settings>;
    return { ...defaultSettings, ...stored, look: { ...defaultSettings.look, ...stored.look }, timing: { ...defaultSettings.timing, ...stored.timing } };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch {
    // Private windows can refuse storage; the editor still works without remembering choices.
  }
}
