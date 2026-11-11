import './style.css';
import { ExportPanel } from './editor/exportPanel';
import { GameInput } from './editor/gameInput';
import { Preview } from './editor/preview';
import { loadSettings, saveSettings } from './editor/settings';
import { SettingsForm } from './editor/settingsForm';
import { Movie } from './export/movie';
import { PieceSet } from './render/pieceSet';
import { SoundBank } from './sound/soundBank';

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const form = new SettingsForm(byId<HTMLFormElement>('settings'));
const preview = new Preview({
  canvas: byId('preview'),
  scrubber: byId('scrubber'),
  playButton: byId('play'),
  clock: byId('clock'),
});
const [pieces, sounds] = await Promise.all([PieceSet.load(), SoundBank.create()]);
const gameInput = new GameInput(byId<HTMLFormElement>('settings'), byId('pgn-status'));
let movie: Movie | undefined;

function refresh(): void {
  const settings = form.read();
  saveSettings(settings);
  const game = gameInput.game;
  if (!game) return;
  movie = new Movie(game, settings, pieces, sounds);
  preview.show(movie);
}

new ExportPanel(
  {
    exportButton: byId('export'),
    cancelButton: byId('cancel'),
    progress: byId('progress'),
    status: byId('export-status'),
    result: byId('result'),
    download: byId('download'),
    media: byId('result-media'),
  },
  () => movie && { movie, format: form.read().format, name: gameInput.fileName },
);

form.write(loadSettings());
form.onChange(refresh);
gameInput.onGame(refresh);
gameInput.start();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
