import { applyPalette, GIFEncoder, quantize } from 'gifenc';
import { yieldToBrowser, type Exporter } from './exporter';
import { GifDelays } from './gifDelays';

interface HeldFrame {
  pixels: Uint8ClampedArray;
  durationMs: number;
}

export const exportGif: Exporter = async (movie, onProgress, signal) => {
  const canvas = movie.createCanvas();
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const paint = movie.painterFor(ctx);
  const encoder = GIFEncoder();
  const delays = new GifDelays();
  const write = (frame: HeldFrame) => {
    const palette = quantize(frame.pixels, 256);
    const delay = delays.next(frame.durationMs) * 10;
    encoder.writeFrame(applyPalette(frame.pixels, palette), canvas.width, canvas.height, { palette, delay });
  };
  let held: HeldFrame | undefined;
  for (let index = 0; index < movie.frameCount; index++) {
    signal.throwIfAborted();
    paint(index * movie.frameMs);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    if (held && samePixels(held.pixels, pixels)) {
      held.durationMs += movie.frameMs;
      continue;
    }
    if (held) write(held);
    held = { pixels, durationMs: movie.frameMs };
    onProgress(index / movie.frameCount);
    await yieldToBrowser();
  }
  if (held) write(held);
  encoder.finish();
  return new Blob([encoder.bytes() as BlobPart], { type: 'image/gif' });
};

function samePixels(first: Uint8ClampedArray, second: Uint8ClampedArray): boolean {
  const a = new Uint32Array(first.buffer);
  const b = new Uint32Array(second.buffer);
  for (let index = 0; index < a.length; index++) if (a[index] !== b[index]) return false;
  return true;
}
