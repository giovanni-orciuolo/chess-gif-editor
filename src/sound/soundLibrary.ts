import { loadLichessSet, type LichessSet } from './lichessSounds';
import { SoundBank } from './soundBank';

export type SoundSet = 'wood' | LichessSet;

export class SoundLibrary {
  private readonly banks = new Map<SoundSet, Promise<SoundBank>>();

  bank(set: SoundSet): Promise<SoundBank> {
    if (!this.banks.has(set)) this.banks.set(set, set === 'wood' ? SoundBank.synthesizeWood() : loadLichessSet(set));
    return this.banks.get(set)!;
  }
}
