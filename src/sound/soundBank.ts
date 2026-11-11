import type { Sound } from './soundCues';

export const sampleRate = 48000;

interface Strike {
  atS: number;
  baseHz: number;
  gain: number;
  decayS: number;
  click: number;
}

interface Ping {
  atS: number;
  fromHz: number;
  toHz: number;
  gain: number;
  decayS: number;
}

interface Recipe {
  strikes: Strike[];
  pings: Ping[];
}

// Inharmonic modes of a small wooden block: a struck piece rings at these ratios of its base pitch.
const woodModes = [
  { ratio: 1, gain: 1, decay: 1 },
  { ratio: 2.31, gain: 0.5, decay: 0.6 },
  { ratio: 3.87, gain: 0.28, decay: 0.4 },
  { ratio: 5.43, gain: 0.14, decay: 0.28 },
];

// Marimba bars ring at roughly 1, 4 and 10 times their fundamental.
const marimbaModes = [
  { ratio: 1, gain: 1, decay: 1 },
  { ratio: 3.93, gain: 0.25, decay: 0.35 },
  { ratio: 9.87, gain: 0.06, decay: 0.15 },
];

const tock = (atS: number, baseHz: number, gain = 0.7): Strike => ({ atS, baseHz, gain, decayS: 0.05, click: 0.35 });

const recipes: Record<Sound, Recipe> = {
  move: { strikes: [tock(0, 960)], pings: [] },
  capture: {
    strikes: [
      { atS: 0, baseHz: 1240, gain: 0.85, decayS: 0.04, click: 0.7 },
      { atS: 0.022, baseHz: 1010, gain: 0.35, decayS: 0.035, click: 0.25 },
    ],
    pings: [],
  },
  castle: { strikes: [tock(0, 940), tock(0.085, 860, 0.6)], pings: [] },
  check: {
    strikes: [{ atS: 0, baseHz: 1100, gain: 0.8, decayS: 0.045, click: 0.55 }],
    pings: [{ atS: 0.005, fromHz: 2640, toHz: 2640, gain: 0.12, decayS: 0.12 }],
  },
  promote: {
    strikes: [tock(0, 980)],
    pings: [{ atS: 0.03, fromHz: 740, toHz: 1480, gain: 0.14, decayS: 0.12 }],
  },
  gameEnd: {
    strikes: [
      { atS: 0.12, baseHz: 659, gain: 0.45, decayS: 0.35, click: 0.05 },
      { atS: 0.3, baseHz: 523, gain: 0.45, decayS: 0.5, click: 0.05 },
    ],
    pings: [],
  },
};

export class SoundBank {
  private constructor(private readonly buffers: Map<Sound, AudioBuffer>) {}

  static async create(): Promise<SoundBank> {
    const entries = await Promise.all(
      Object.entries(recipes).map(async ([sound, recipe]) => [sound as Sound, await synthesize(sound as Sound, recipe)] as const),
    );
    return new SoundBank(new Map(entries));
  }

  buffer(sound: Sound): AudioBuffer {
    return this.buffers.get(sound)!;
  }
}

async function synthesize(sound: Sound, recipe: Recipe): Promise<AudioBuffer> {
  const context = new OfflineAudioContext(1, Math.ceil(sampleRate * 1.6), sampleRate);
  const modes = sound === 'gameEnd' ? marimbaModes : woodModes;
  recipe.strikes.forEach((strike) => addStrike(context, strike, modes));
  recipe.pings.forEach((ping) => addPing(context, ping));
  return context.startRendering();
}

function addStrike(context: OfflineAudioContext, strike: Strike, modes: typeof woodModes): void {
  for (const mode of modes) {
    const oscillator = new OscillatorNode(context, { type: 'sine', frequency: strike.baseHz * mode.ratio });
    const gain = decayingGain(context, strike.atS, strike.gain * mode.gain * 0.5, strike.decayS * mode.decay);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(strike.atS);
    oscillator.stop(strike.atS + strike.decayS * 8);
  }
  if (strike.click > 0) addClick(context, strike.atS, strike.click * strike.gain);
}

function addClick(context: OfflineAudioContext, atS: number, level: number): void {
  const noise = new AudioBufferSourceNode(context, { buffer: noiseBuffer(context) });
  const highpass = new BiquadFilterNode(context, { type: 'highpass', frequency: 2500 });
  const gain = decayingGain(context, atS, level, 0.004);
  noise.connect(highpass).connect(gain).connect(context.destination);
  noise.start(atS);
  noise.stop(atS + 0.04);
}

function addPing(context: OfflineAudioContext, ping: Ping): void {
  const oscillator = new OscillatorNode(context, { type: 'sine', frequency: ping.fromHz });
  oscillator.frequency.setValueAtTime(ping.fromHz, ping.atS);
  oscillator.frequency.exponentialRampToValueAtTime(ping.toHz, ping.atS + ping.decayS);
  const gain = decayingGain(context, ping.atS, ping.gain, ping.decayS);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(ping.atS);
  oscillator.stop(ping.atS + ping.decayS * 8);
}

function decayingGain(context: OfflineAudioContext, atS: number, peak: number, decayS: number): GainNode {
  const gain = new GainNode(context, { gain: 0 });
  gain.gain.setValueAtTime(0, atS);
  gain.gain.linearRampToValueAtTime(peak, atS + 0.001);
  gain.gain.setTargetAtTime(0, atS + 0.001, decayS);
  return gain;
}

function noiseBuffer(context: OfflineAudioContext): AudioBuffer {
  const buffer = context.createBuffer(1, Math.ceil(sampleRate * 0.04), sampleRate);
  const samples = buffer.getChannelData(0);
  let seed = 12345;
  for (let index = 0; index < samples.length; index++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    samples[index] = seed / 0x3fffffff - 1;
  }
  return buffer;
}
