import type { Movie } from '../export/movie';

export interface PreviewControls {
  canvas: HTMLCanvasElement;
  scrubber: HTMLInputElement;
  playButton: HTMLButtonElement;
  clock: HTMLElement;
}

export class Preview {
  private paint: (ms: number) => void = () => {};
  private durationMs = 0;
  private positionMs = 0;
  private playingSince?: number;

  constructor(private readonly controls: PreviewControls) {
    controls.playButton.addEventListener('click', () => this.toggle());
    controls.scrubber.addEventListener('input', () => this.seek(controls.scrubber.valueAsNumber));
  }

  show(movie: Movie): void {
    movie.fit(this.controls.canvas);
    this.paint = movie.painterFor(this.controls.canvas.getContext('2d')!);
    this.durationMs = movie.durationMs;
    this.controls.scrubber.max = String(movie.durationMs);
    this.seek(Math.min(this.positionMs, movie.durationMs));
  }

  private toggle(): void {
    if (this.playingSince !== undefined) return this.pause();
    if (this.positionMs >= this.durationMs) this.positionMs = 0;
    this.playingSince = performance.now() - this.positionMs;
    this.setPlayButton('❚❚', 'Pause');
    requestAnimationFrame((now) => this.tick(now));
  }

  private pause(): void {
    this.playingSince = undefined;
    this.setPlayButton('▶', 'Play');
  }

  private tick(now: number): void {
    if (this.playingSince === undefined) return;
    const position = now - this.playingSince;
    if (position >= this.durationMs) {
      this.seek(this.durationMs);
      return this.pause();
    }
    this.seek(position);
    requestAnimationFrame((next) => this.tick(next));
  }

  private seek(ms: number): void {
    this.positionMs = ms;
    if (this.playingSince !== undefined) this.playingSince = performance.now() - ms;
    this.paint(ms);
    this.controls.scrubber.value = String(ms);
    this.controls.clock.textContent = `${seconds(ms)} / ${seconds(this.durationMs)} s`;
  }

  private setPlayButton(symbol: string, label: string): void {
    this.controls.playButton.textContent = symbol;
    this.controls.playButton.setAttribute('aria-label', label);
  }
}

function seconds(ms: number): string {
  return (ms / 1000).toFixed(1);
}
