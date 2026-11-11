import './style.css';
import { ExportPanel } from './editor/exportPanel';
import { GameInput } from './editor/gameInput';
import { Preview } from './editor/preview';
import { loadSettings, saveSettings } from './editor/settings';
import { SettingsForm } from './editor/settingsForm';
import { Movie } from './export/movie';
import { PieceSet } from './render/pieceSet';
import { SharePanel } from './share/sharePanel';
import { SoundLibrary } from './sound/soundLibrary';

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const form = new SettingsForm(byId<HTMLFormElement>('settings'));
const preview = new Preview({
  canvas: byId('preview'),
  scrubber: byId('scrubber'),
  playButton: byId('play'),
  clock: byId('clock'),
});
const pieces = await PieceSet.load();
const soundLibrary = new SoundLibrary();
const gameInput = new GameInput(byId<HTMLFormElement>('settings'), byId('pgn-status'));
let movie: Movie | undefined;
let latestRefresh = 0;

async function refresh(): Promise<void> {
  const refreshId = ++latestRefresh;
  const settings = form.read();
  saveSettings(settings);
  const game = gameInput.game;
  if (!game) return;
  const sounds = await soundLibrary.bank(settings.soundSet);
  if (refreshId !== latestRefresh) return;
  movie = new Movie(game, settings, pieces, sounds);
  preview.show(movie);
}

const sharePanel = new SharePanel({
  fileButton: byId('share-file'),
  copyButton: byId('copy-caption'),
  links: byId('share-links'),
  status: byId('share-status'),
});

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
  (file) => gameInput.game && sharePanel.show(file, gameInput.game.players),
);

form.write(loadSettings());
form.onChange(() => void refresh());
gameInput.onGame(() => void refresh());
gameInput.start();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
