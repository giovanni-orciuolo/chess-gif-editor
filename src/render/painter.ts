import type { Scene, Sprite } from '../animation/scene';
import type { Player } from '../game/parseGame';
import { squareCoordinates, type Square } from '../game/placement';
import type { Layout } from './layout';
import type { PieceSet } from './pieceSet';
import type { BoardColors } from './theme';

export interface Look {
  colors: BoardColors;
  flipped: boolean;
  coordinates: boolean;
  highlightMove: boolean;
  moveLabel: boolean;
  ratings: boolean;
}

export interface Players {
  white: Player;
  black: Player;
}

const font = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const barColor = '#262421';

export class Painter {
  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly pieces: PieceSet,
    private readonly layout: Layout,
    private readonly look: Look,
    private readonly players: Players,
  ) {}

  paint(scene: Scene): void {
    this.paintSquares();
    if (this.look.highlightMove && scene.highlight) this.paintHighlight(scene.highlight);
    if (this.look.coordinates) this.paintCoordinates();
    scene.sprites.forEach((sprite) => this.paintSprite(sprite));
    if (this.layout.barHeight) this.paintBars(scene);
    if (!this.layout.barHeight && this.look.moveLabel && scene.caption) this.paintBadge(scene.caption);
  }

  private paintSquares(): void {
    const { square } = this.layout;
    for (let column = 0; column < 8; column++) {
      for (let row = 0; row < 8; row++) {
        this.ctx.fillStyle = (column + row) % 2 === 0 ? this.look.colors.light : this.look.colors.dark;
        this.ctx.fillRect(column * square, this.layout.boardTop + row * square, square, square);
      }
    }
  }

  private paintHighlight(move: { from: Square; to: Square }): void {
    const { square } = this.layout;
    this.ctx.save();
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillStyle = this.look.colors.highlight;
    for (const target of [move.from, move.to]) {
      const { x, y } = this.toScreen(squareCoordinates(target));
      this.ctx.fillRect(x, y, square, square);
    }
    this.ctx.restore();
  }

  private paintCoordinates(): void {
    const { square, boardTop } = this.layout;
    const margin = square * 0.06;
    this.ctx.font = `600 ${Math.round(square * 0.2)}px ${font}`;
    for (let index = 0; index < 8; index++) {
      const file = this.look.flipped ? 7 - index : index;
      const rank = this.look.flipped ? index + 1 : 8 - index;
      this.ctx.fillStyle = this.coordinateColor(index, 0);
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(String(rank), margin, boardTop + index * square + margin);
      this.ctx.fillStyle = this.coordinateColor(index, 7);
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'bottom';
      this.ctx.fillText('abcdefgh'[file], (index + 1) * square - margin, boardTop + 8 * square - margin);
    }
  }

  private coordinateColor(row: number, column: number): string {
    return (row + column) % 2 === 0 ? this.look.colors.dark : this.look.colors.light;
  }

  private paintSprite(sprite: Sprite): void {
    const { square } = this.layout;
    const { x, y } = this.toScreen(sprite);
    this.ctx.save();
    this.ctx.globalAlpha = sprite.opacity;
    this.ctx.drawImage(this.pieces.sprite(sprite.code, square), x, y);
    this.ctx.restore();
  }

  private paintBars(scene: Scene): void {
    const [top, bottom] = this.look.flipped ? (['w', 'b'] as const) : (['b', 'w'] as const);
    this.paintBar(0, top, scene);
    this.paintBar(this.layout.boardTop + this.layout.width, bottom, scene);
  }

  private paintBar(y: number, side: 'w' | 'b', scene: Scene): void {
    const { width, barHeight } = this.layout;
    const player = side === 'w' ? this.players.white : this.players.black;
    const middle = y + barHeight / 2;
    const padding = barHeight * 0.35;
    this.ctx.fillStyle = barColor;
    this.ctx.fillRect(0, y, width, barHeight);
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = 'left';
    this.ctx.font = `600 ${Math.round(barHeight * 0.42)}px ${font}`;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(player.name, padding, middle);
    const nameWidth = this.ctx.measureText(player.name).width;
    this.ctx.font = `${Math.round(barHeight * 0.38)}px ${font}`;
    this.ctx.fillStyle = '#9e9b98';
    if (this.look.ratings && player.rating) this.ctx.fillText(`(${player.rating})`, padding * 1.4 + nameWidth, middle);
    if (!this.look.moveLabel || scene.mover !== side) return;
    this.ctx.textAlign = 'right';
    this.ctx.font = `600 ${Math.round(barHeight * 0.42)}px ${font}`;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(scene.caption, width - padding, middle);
  }

  private paintBadge(caption: string): void {
    const { square } = this.layout;
    const height = Math.round(square * 0.42);
    this.ctx.font = `600 ${Math.round(height * 0.6)}px ${font}`;
    const width = this.ctx.measureText(caption).width + height * 0.8;
    const x = this.layout.width - width - square * 0.12;
    const y = square * 0.12;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, height / 4);
    this.ctx.fill();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(caption, x + width / 2, y + height / 2);
  }

  private toScreen(position: { file: number; rank: number }): { x: number; y: number } {
    const { square, boardTop } = this.layout;
    const column = this.look.flipped ? 7 - position.file : position.file;
    const row = this.look.flipped ? position.rank : 7 - position.rank;
    return { x: column * square, y: boardTop + row * square };
  }
}
