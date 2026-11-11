import { parseGame, type Game } from '../game/parseGame';
import { samplePgn } from './samplePgn';

const storageKey = 'chess-gif-editor.pgn';

export class GameInput {
  game?: Game;
  private listener: () => void = () => {};
  private debounce?: number;

  constructor(
    private readonly form: HTMLFormElement,
    private readonly status: HTMLElement,
  ) {
    this.textarea.addEventListener('input', () => this.parseSoon());
    this.fileInput.addEventListener('change', () => void this.readFile(this.fileInput.files?.[0]));
    this.textarea.addEventListener('dragover', (event) => event.preventDefault());
    this.textarea.addEventListener('drop', (event) => {
      event.preventDefault();
      void this.readFile(event.dataTransfer?.files[0]);
    });
    form.querySelector('[data-action="sample"]')!.addEventListener('click', () => this.load(samplePgn));
  }

  start(): void {
    this.textarea.value = remembered() ?? samplePgn;
    this.parse(false);
  }

  onGame(listener: () => void): void {
    this.listener = listener;
  }

  get fileName(): string {
    const players = this.game?.players;
    if (!players) return 'chess-game';
    return `${players.white.name}-vs-${players.black.name}`.replace(/[^\w.-]+/g, '_');
  }

  private load(pgn: string): void {
    this.textarea.value = pgn;
    this.parse(true);
  }

  private async readFile(file: File | undefined): Promise<void> {
    if (file) this.load(await file.text());
  }

  private parseSoon(): void {
    clearTimeout(this.debounce);
    this.debounce = window.setTimeout(() => this.parse(true), 300);
  }

  private parse(isNewGame: boolean): void {
    try {
      this.game = parseGame(this.textarea.value);
    } catch (error) {
      this.status.textContent = (error as Error).message;
      this.status.classList.add('error');
      return;
    }
    remember(this.textarea.value);
    this.showSummary(this.game);
    this.limitRange(this.game.plies.length, isNewGame);
    this.listener();
  }

  private showSummary(game: Game): void {
    const { white, black } = game.players;
    this.status.classList.remove('error');
    this.status.textContent = `${white.name} vs ${black.name}, ${game.plies.length} plies, result ${game.result}.`;
  }

  private limitRange(plyCount: number, reset: boolean): void {
    const first = this.form.elements.namedItem('firstPly') as HTMLInputElement;
    const last = this.form.elements.namedItem('lastPly') as HTMLInputElement;
    first.max = last.max = String(Math.max(1, plyCount));
    if (reset || last.valueAsNumber > plyCount) last.value = String(plyCount);
    if (reset || first.valueAsNumber > plyCount) first.value = '1';
  }

  private get textarea(): HTMLTextAreaElement {
    return this.form.elements.namedItem('pgn') as HTMLTextAreaElement;
  }

  private get fileInput(): HTMLInputElement {
    return this.form.elements.namedItem('pgnFile') as HTMLInputElement;
  }
}

function remembered(): string | null {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function remember(pgn: string): void {
  try {
    localStorage.setItem(storageKey, pgn);
  } catch {
    // Storage is optional: without it the editor only forgets the last game on reload.
  }
}
