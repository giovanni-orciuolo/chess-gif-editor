import type { PieceCode } from '../game/placement';

const svgUrls = import.meta.glob<string>('./pieces/*.svg', { eager: true, query: '?url', import: 'default' });

export class PieceSet {
  private readonly rasters = new Map<string, HTMLCanvasElement>();

  private constructor(private readonly images: Map<PieceCode, HTMLImageElement>) {}

  static async load(): Promise<PieceSet> {
    const entries = await Promise.all(
      Object.entries(svgUrls).map(async ([path, url]) => [codeOf(path), await loadImage(url)] as const),
    );
    return new PieceSet(new Map(entries));
  }

  sprite(code: PieceCode, size: number): HTMLCanvasElement {
    const key = `${code}@${size}`;
    const cached = this.rasters.get(key);
    if (cached) return cached;
    const raster = rasterize(this.images.get(code)!, size);
    this.rasters.set(key, raster);
    return raster;
  }
}

function codeOf(path: string): PieceCode {
  return path.slice(-6, -4) as PieceCode;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Piece image did not load: ${url}`));
    image.src = url;
  });
}

function rasterize(image: HTMLImageElement, size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  canvas.getContext('2d')!.drawImage(image, 0, 0, size, size);
  return canvas;
}
