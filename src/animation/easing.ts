import type { Easing } from './scene';

export const easings = {
  linear: (t) => t,
  easeInOut: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  easeOut: (t) => 1 - (1 - t) ** 3,
} satisfies Record<string, Easing>;

export type EasingName = keyof typeof easings;
