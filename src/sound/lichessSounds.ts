import { sampleRate, SoundBank } from './soundBank';
import type { Sound } from './soundCues';

export type LichessSet = 'sfx' | 'piano' | 'nes' | 'futuristic';

const urls = import.meta.glob<string>('./lichess/*/*.mp3', { eager: true, query: '?url', import: 'default' });

// Lichess plays its plain move sound for castling and promotion too.
const fileFor: Record<Sound, string> = {
  move: 'Move',
  capture: 'Capture',
  castle: 'Move',
  promote: 'Move',
  check: 'Check',
  gameEnd: 'GenericNotify',
};

export async function loadLichessSet(set: LichessSet): Promise<SoundBank> {
  const decoder = new OfflineAudioContext(1, 1, sampleRate);
  const decoded = new Map<string, Promise<AudioBuffer>>();
  const decode = (file: string) => {
    if (!decoded.has(file)) decoded.set(file, fetchAndDecode(decoder, urls[`./lichess/${set}/${file}.mp3`]));
    return decoded.get(file)!;
  };
  const entries = await Promise.all(
    Object.entries(fileFor).map(async ([sound, file]) => [sound as Sound, await decode(file)] as const),
  );
  return new SoundBank(new Map(entries));
}

async function fetchAndDecode(decoder: OfflineAudioContext, url: string): Promise<AudioBuffer> {
  const response = await fetch(url);
  return decoder.decodeAudioData(await response.arrayBuffer());
}
