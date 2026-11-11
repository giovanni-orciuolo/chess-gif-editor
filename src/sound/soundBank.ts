import type { Sound } from './soundCues';

export const sampleRate = 48000;

interface Knock {
  atS: number;
  clickHz: number;
  bodyHz: number;
  gain: number;
}

interface Tone {
  atS: number;
  hz: number;
  lengthS: number;
  gain: number;
}

interface Recipe {
  knocks: Knock[];
  tones: Tone[];
}

const recipes: Record<Sound, Recipe> = {
  move: { knocks: [{ atS: 0, clickHz: 1600, bodyHz: 190, gain: 0.8 }], tones: [] },
  capture: {
    knocks: [
      { atS: 0, clickHz: 2600, bodyHz: 240, gain: 1 },
      { atS: 0.03, clickHz: 1900, bodyHz: 170, gain: 0.45 },
    ],
    tones: [],
  },
  castle: {
    knocks: [
      { atS: 0, clickHz: 1600, bodyHz: 190, gain: 0.8 },
      { atS: 0.11, clickHz: 1500, bodyHz: 170, gain: 0.7 },
    ],
    tones: [],
  },
  promote: {
    knocks: [{ atS: 0, clickHz: 1700, bodyHz: 200, gain: 0.8 }],
    tones: [
      { atS: 0.04, hz: 880, lengthS: 0.18, gain: 0.18 },
      { atS: 0.12, hz: 1320, lengthS: 0.3, gain: 0.18 },
    ],
  },
  check: {
    knocks: [{ atS: 0, clickHz: 2200, bodyHz: 230, gain: 0.9 }],
    tones: [{ atS: 0.02, hz: 988, lengthS: 0.16, gain: 0.16 }],
  },
  gameEnd: {
    knocks: [],
    tones: [
      { atS: 0.15, hz: 523, lengthS: 1.2, gain: 0.14 },
      { atS: 0.15, hz: 659, lengthS: 1.2, gain: 0.12 },
      { atS: 0.15, hz: 784, lengthS: 1.2, gain: 0.12 },
    ],
  },
};

export class SoundBank {
  private constructor(private readonly buffers: Map<Sound, AudioBuffer>) {}

  static async create(): Promise<SoundBank> {
    const entries = await Promise.all(
      Object.entries(recipes).map(async ([sound, recipe]) => [sound as Sound, await synthesize(recipe)] as const),
    );
    return new SoundBank(new Map(entries));
  }

  buffer(sound: Sound): AudioBuffer {
    return this.buffers.get(sound)!;
  }
}

async function synthesize(recipe: Recipe): Promise<AudioBuffer> {
  const context = new OfflineAudioContext(1, Math.ceil(sampleRate * 1.6), sampleRate);
  recipe.knocks.forEach((knock) => addKnock(context, knock));
  recipe.tones.forEach((tone) => addTone(context, tone));
  return context.startRendering();
}

function addKnock(context: OfflineAudioContext, knock: Knock): void {
  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer(context);
  const band = new BiquadFilterNode(context, { type: 'bandpass', frequency: knock.clickHz, Q: 1.2 });
  const click = envelope(context, knock.atS, knock.gain, 0.045);
  noise.connect(band).connect(click).connect(context.destination);
  noise.start(knock.atS);

  const body = new OscillatorNode(context, { type: 'sine', frequency: knock.bodyHz });
  body.frequency.setValueAtTime(knock.bodyHz, knock.atS);
  body.frequency.exponentialRampToValueAtTime(knock.bodyHz * 0.6, knock.atS + 0.08);
  const thump = envelope(context, knock.atS, knock.gain * 0.7, 0.07);
  body.connect(thump).connect(context.destination);
  body.start(knock.atS);
  body.stop(knock.atS + 0.2);
}

function addTone(context: OfflineAudioContext, tone: Tone): void {
  const oscillator = new OscillatorNode(context, { type: 'triangle', frequency: tone.hz });
  const gain = envelope(context, tone.atS, tone.gain, tone.lengthS);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(tone.atS);
  oscillator.stop(tone.atS + tone.lengthS * 4);
}

function envelope(context: OfflineAudioContext, atS: number, peak: number, decayS: number): GainNode {
  const gain = new GainNode(context, { gain: 0 });
  gain.gain.setValueAtTime(0, atS);
  gain.gain.linearRampToValueAtTime(peak, atS + 0.002);
  gain.gain.setTargetAtTime(0, atS + 0.002, decayS / 3);
  return gain;
}

function noiseBuffer(context: OfflineAudioContext): AudioBuffer {
  const buffer = context.createBuffer(1, Math.ceil(sampleRate * 0.25), sampleRate);
  const samples = buffer.getChannelData(0);
  let seed = 12345;
  for (let index = 0; index < samples.length; index++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    samples[index] = (seed / 0x3fffffff) - 1;
  }
  return buffer;
}
