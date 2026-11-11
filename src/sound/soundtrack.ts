import { sampleRate, type SoundBank } from './soundBank';
import type { SoundCue } from './soundCues';

export function renderSoundtrack(bank: SoundBank, cues: SoundCue[], durationMs: number, volume: number): Promise<AudioBuffer> {
  const context = new OfflineAudioContext(1, Math.ceil((sampleRate * durationMs) / 1000), sampleRate);
  const output = new GainNode(context, { gain: volume });
  output.connect(context.destination);
  for (const cue of cues) {
    const source = new AudioBufferSourceNode(context, { buffer: bank.buffer(cue.sound) });
    source.connect(output);
    source.start(cue.atMs / 1000);
  }
  return context.startRendering();
}
