import { BufferTarget, CanvasSource, getFirstEncodableVideoCodec, Mp4OutputFormat, Output, QUALITY_HIGH } from 'mediabunny';
import { yieldToBrowser, type Exporter } from './exporter';

export const exportMp4: Exporter = async (movie, onProgress, signal) => {
  const canvas = movie.createCanvas();
  const paint = movie.painterFor(canvas.getContext('2d')!);
  const { width, height } = canvas;
  const codec = await getFirstEncodableVideoCodec(['avc', 'vp9', 'av1'], { width, height });
  if (!codec) throw new Error('This browser cannot encode video. Choose GIF, or use a recent Chrome, Edge or Safari.');
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
  const source = new CanvasSource(canvas, { codec, bitrate: QUALITY_HIGH });
  output.addVideoTrack(source, { frameRate: movie.fps });
  await output.start();
  try {
    for (let index = 0; index < movie.frameCount; index++) {
      signal.throwIfAborted();
      paint(index * movie.frameMs);
      await source.add(index / movie.fps, 1 / movie.fps);
      onProgress(index / movie.frameCount);
      if (index % 10 === 0) await yieldToBrowser();
    }
    await output.finalize();
  } catch (error) {
    await output.cancel();
    throw error;
  }
  return new Blob([output.target.buffer!], { type: 'video/mp4' });
};
