import type { Movie } from '../export/movie';
import type { SoundCue } from '../sound/soundCues';

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
  private movie?: Movie;
  private audio?: AudioContext;

  constructor(private readonly controls: PreviewControls) {
    controls.playButton.addEventListener('click', () => this.toggle());
    controls.scrubber.addEventListener('input', () => this.seek(controls.scrubber.valueAsNumber));
  }

  show(movie: Movie): void {
    this.movie = movie;
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
    this.audio ??= new AudioContext();
    void this.audio.resume();
    this.setPlayButton('❚❚', 'Pause');
    requestAnimationFrame((now) => this.tick(now));
  }

  private pause(): void {
    this.playingSince = undefined;
    this.setPlayButton('▶', 'Play');
  }

  private tick(now: number): void {
    if (this.playingSince === undefined) return;
    const position = Math.min(now - this.playingSince, this.durationMs);
    this.playCuesBetween(this.positionMs, position);
    if (position >= this.durationMs) {
      this.seek(this.durationMs);
      return this.pause();
    }
    this.seek(position);
    requestAnimationFrame((next) => this.tick(next));
  }

  private playCuesBetween(fromMs: number, toMs: number): void {
    const crossed = (cue: SoundCue) => cue.atMs > fromMs && cue.atMs <= toMs;
    for (const cue of this.movie?.soundCues.filter(crossed) ?? []) this.play(cue);
  }

  private play(cue: SoundCue): void {
    if (!this.audio || !this.movie) return;
    const source = new AudioBufferSourceNode(this.audio, { buffer: this.movie.sounds.buffer(cue.sound) });
    source.connect(new GainNode(this.audio, { gain: this.movie.volume })).connect(this.audio.destination);
    source.start();
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
