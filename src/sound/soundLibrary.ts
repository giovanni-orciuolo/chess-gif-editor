import { loadRecordedSet, type RecordedSet } from './recordedSounds';
import { SoundBank } from './soundBank';

export type SoundSet = 'wood' | RecordedSet;

export class SoundLibrary {
  private readonly banks = new Map<SoundSet, Promise<SoundBank>>();

  bank(set: SoundSet): Promise<SoundBank> {
    if (!this.banks.has(set)) this.banks.set(set, set === 'wood' ? SoundBank.synthesizeWood() : loadRecordedSet(set));
    return this.banks.get(set)!;
  }
}
