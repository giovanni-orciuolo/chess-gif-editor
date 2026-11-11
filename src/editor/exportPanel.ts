import type { Exporter } from '../export/exporter';
import { exportGif } from '../export/exportGif';
import { exportMp4 } from '../export/exportMp4';
import type { Movie } from '../export/movie';
import type { Format } from './settings';

const exporters: Record<Format, Exporter> = { mp4: exportMp4, gif: exportGif };

export interface ExportElements {
  exportButton: HTMLButtonElement;
  cancelButton: HTMLButtonElement;
  progress: HTMLProgressElement;
  status: HTMLElement;
  result: HTMLElement;
  download: HTMLAnchorElement;
  media: HTMLElement;
}

export class ExportPanel {
  private running?: AbortController;
  private resultUrl?: string;

  constructor(
    private readonly elements: ExportElements,
    private readonly current: () => { movie: Movie; format: Format; name: string } | undefined,
    private readonly onExported: (file: File) => void,
  ) {
    elements.exportButton.addEventListener('click', () => void this.run());
    elements.cancelButton.addEventListener('click', () => this.running?.abort());
  }

  private async run(): Promise<void> {
    const job = this.current();
    if (!job) return;
    this.running = new AbortController();
    this.setBusy(true);
    const startedAt = performance.now();
    try {
      const blob = await exporters[job.format](job.movie, (done) => this.showProgress(done), this.running.signal);
      this.showResult(blob, `${job.name}.${job.format}`, performance.now() - startedAt);
    } catch (error) {
      this.elements.status.textContent = this.running.signal.aborted ? 'Export cancelled.' : `Export failed: ${(error as Error).message}`;
    } finally {
      this.setBusy(false);
      this.running = undefined;
    }
  }

  private setBusy(busy: boolean): void {
    this.elements.exportButton.disabled = busy;
    this.elements.cancelButton.hidden = !busy;
    this.elements.progress.hidden = !busy;
    this.elements.progress.value = 0;
    if (busy) this.elements.status.textContent = 'Rendering frames…';
  }

  private showProgress(done: number): void {
    this.elements.progress.value = done;
    this.elements.status.textContent = `Rendering frames… ${Math.round(done * 100)}%`;
  }

  private showResult(blob: Blob, fileName: string, elapsedMs: number): void {
    if (this.resultUrl) URL.revokeObjectURL(this.resultUrl);
    this.resultUrl = URL.createObjectURL(blob);
    this.elements.download.href = this.resultUrl;
    this.elements.download.download = fileName;
    this.elements.download.textContent = `Download ${fileName} (${megabytes(blob.size)} MB)`;
    this.elements.media.replaceChildren(mediaFor(blob.type, this.resultUrl));
    this.elements.result.hidden = false;
    this.elements.status.textContent = `Done in ${(elapsedMs / 1000).toFixed(1)} s.`;
    this.onExported(new File([blob], fileName, { type: blob.type }));
  }
}

function mediaFor(type: string, url: string): HTMLElement {
  if (type === 'image/gif') return Object.assign(document.createElement('img'), { src: url, alt: 'Exported GIF' });
  return Object.assign(document.createElement('video'), { src: url, controls: true, loop: true });
}

function megabytes(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2);
}
