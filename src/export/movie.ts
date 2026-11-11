import { easings } from '../animation/easing';
import { sceneAt } from '../animation/scene';
import { Timeline } from '../animation/timeline';
import type { Settings } from '../editor/settings';
import { excerpt } from '../game/excerpt';
import type { Game } from '../game/parseGame';
import { Layout } from '../render/layout';
import { Painter } from '../render/painter';
import type { PieceSet } from '../render/pieceSet';
import type { SoundBank } from '../sound/soundBank';
import { soundCues, type SoundCue } from '../sound/soundCues';
import { renderSoundtrack } from '../sound/soundtrack';

export class Movie {
  readonly layout: Layout;
  readonly fps: number;
  readonly soundCues: SoundCue[];
  private readonly game: Game;
  private readonly timeline: Timeline;

  constructor(
    game: Game,
    private readonly settings: Settings,
    private readonly pieces: PieceSet,
    readonly sounds: SoundBank,
  ) {
    this.game = excerpt(game, settings.firstPly, settings.lastPly);
    this.timeline = new Timeline(this.game.plies.length, settings.timing);
    this.layout = new Layout(settings.size, settings.playerBars);
    this.fps = settings.fps;
    this.soundCues = settings.sound ? soundCues(this.game, settings.timing) : [];
  }

  get durationMs(): number {
    return this.timeline.durationMs;
  }

  get frameCount(): number {
    return Math.ceil((this.durationMs * this.fps) / 1000);
  }

  get frameMs(): number {
    return 1000 / this.fps;
  }

  soundtrack(): Promise<AudioBuffer> {
    return renderSoundtrack(this.sounds, this.soundCues, this.durationMs);
  }

  createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    this.fit(canvas);
    return canvas;
  }

  fit(canvas: HTMLCanvasElement): void {
    canvas.width = this.layout.width;
    canvas.height = this.layout.height;
  }

  painterFor(ctx: CanvasRenderingContext2D): (ms: number) => void {
    const painter = new Painter(ctx, this.pieces, this.layout, this.settings.look, this.game.players);
    const ease = easings[this.settings.easing];
    return (ms) => painter.paint(sceneAt(this.game, this.timeline.frameAt(ms), ease));
  }
}
