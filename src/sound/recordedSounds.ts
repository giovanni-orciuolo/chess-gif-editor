import { sampleRate, SoundBank } from './soundBank';
import type { Sound } from './soundCues';

type SetFiles = Record<Sound, string>;

// Lichess plays its plain move sound for castling and promotion too.
const lichess = (set: string): SetFiles => ({
  move: `lichess/${set}/Move.mp3`,
  capture: `lichess/${set}/Capture.mp3`,
  castle: `lichess/${set}/Move.mp3`,
  promote: `lichess/${set}/Move.mp3`,
  check: `lichess/${set}/Check.mp3`,
  gameEnd: `lichess/${set}/GenericNotify.mp3`,
});

const recordedSets = {
  sfx: lichess('sfx'),
  piano: lichess('piano'),
  nes: lichess('nes'),
  futuristic: lichess('futuristic'),
  pychess: {
    move: 'pychess/move1.wav',
    capture: 'pychess/capture1.wav',
    castle: 'pychess/castle.wav',
    promote: 'pychess/move1.wav',
    check: 'pychess/check1.wav',
    gameEnd: 'pychess/obs_end.wav',
  },
} satisfies Record<string, SetFiles>;

export type RecordedSet = keyof typeof recordedSets;

const urls = import.meta.glob<string>('./recorded/**/*.{mp3,wav}', { eager: true, query: '?url', import: 'default' });

export async function loadRecordedSet(set: RecordedSet): Promise<SoundBank> {
  const decoder = new OfflineAudioContext(1, 1, sampleRate);
  const decoded = new Map<string, Promise<AudioBuffer>>();
  const decode = (file: string) => {
    if (!decoded.has(file)) decoded.set(file, fetchAndDecode(decoder, urls[`./recorded/${file}`]));
    return decoded.get(file)!;
  };
  const entries = await Promise.all(
    Object.entries(recordedSets[set]).map(async ([sound, file]) => [sound as Sound, await decode(file)] as const),
  );
  return new SoundBank(new Map(entries));
}

async function fetchAndDecode(decoder: OfflineAudioContext, url: string): Promise<AudioBuffer> {
  const response = await fetch(url);
  return normalized(await decoder.decodeAudioData(await response.arrayBuffer()));
}

// Sets are recorded at very different levels; one peak keeps the volume slider meaningful across them.
function normalized(buffer: AudioBuffer): AudioBuffer {
  const targetPeak = 0.9;
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));
  const peak = Math.max(...channels.map((samples) => samples.reduce((max, sample) => Math.max(max, Math.abs(sample)), 0)));
  if (peak === 0) return buffer;
  for (const samples of channels) for (let index = 0; index < samples.length; index++) samples[index] *= targetPeak / peak;
  return buffer;
}
