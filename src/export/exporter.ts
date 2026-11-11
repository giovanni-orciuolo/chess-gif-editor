import type { Movie } from './movie';

export type Progress = (fraction: number) => void;

export type Exporter = (movie: Movie, onProgress: Progress, signal: AbortSignal) => Promise<Blob>;

export function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}
