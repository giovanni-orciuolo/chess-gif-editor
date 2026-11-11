export class Layout {
  readonly square: number;
  readonly width: number;
  readonly barHeight: number;

  constructor(requestedSize: number, withPlayerBars: boolean) {
    this.square = Math.floor(requestedSize / 8);
    this.width = this.square * 8;
    this.barHeight = withPlayerBars ? 2 * Math.round(this.width / 24) : 0;
  }

  get boardTop(): number {
    return this.barHeight;
  }

  get height(): number {
    return this.width + 2 * this.barHeight;
  }
}
