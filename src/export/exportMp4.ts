import {
  AudioBufferSource,
  BufferTarget,
  CanvasSource,
  getFirstEncodableAudioCodec,
  getFirstEncodableVideoCodec,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  QUALITY_MEDIUM,
} from 'mediabunny';
import { yieldToBrowser, type Exporter } from './exporter';
import type { Movie } from './movie';

export const exportMp4: Exporter = async (movie, onProgress, signal) => {
  const canvas = movie.createCanvas();
  const paint = movie.painterFor(canvas.getContext('2d')!);
  const { width, height } = canvas;
  const codec = await getFirstEncodableVideoCodec(['avc', 'vp9', 'av1'], { width, height });
  if (!codec) throw new Error('This browser cannot encode video. Choose GIF, or use a recent Chrome, Edge or Safari.');
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
  const video = new CanvasSource(canvas, { codec, bitrate: QUALITY_HIGH });
  output.addVideoTrack(video, { frameRate: movie.fps });
  const audio = await audioSource(movie);
  if (audio) output.addAudioTrack(audio);
  await output.start();
  try {
    if (audio) await audio.add(await movie.soundtrack());
    for (let index = 0; index < movie.frameCount; index++) {
      signal.throwIfAborted();
      paint(index * movie.frameMs);
      await video.add(index / movie.fps, 1 / movie.fps);
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

async function audioSource(movie: Movie): Promise<AudioBufferSource | undefined> {
  if (movie.soundCues.length === 0) return undefined;
  const codec = await getFirstEncodableAudioCodec(['aac', 'opus']);
  return codec ? new AudioBufferSource({ codec, bitrate: QUALITY_MEDIUM }) : undefined;
}
