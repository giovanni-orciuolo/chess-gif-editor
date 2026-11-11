import type { Players } from '../render/painter';
import { shareCaption } from './shareCaption';

export interface ShareElements {
  fileButton: HTMLButtonElement;
  copyButton: HTMLButtonElement;
  status: HTMLElement;
}

export class SharePanel {
  private file?: File;
  private caption = '';

  constructor(private readonly elements: ShareElements) {
    elements.fileButton.addEventListener('click', () => void this.shareFile());
    elements.copyButton.addEventListener('click', () => void this.copyCaption());
  }

  show(file: File, players: Players): void {
    this.file = file;
    this.caption = shareCaption(players);
    const shareable = canShare(file);
    this.elements.fileButton.hidden = !shareable;
    this.elements.fileButton.textContent = `Share ${file.type === 'image/gif' ? 'GIF' : 'video'}`;
    this.elements.status.textContent = shareable
      ? ''
      : 'This browser cannot share files. Open the editor on your phone to share straight into an app.';
  }

  private async shareFile(): Promise<void> {
    if (!this.file) return;
    try {
      await navigator.share({ files: [this.file], title: 'Chess GIF Editor', text: this.caption });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') this.elements.status.textContent = `Sharing failed: ${(error as Error).message}`;
    }
  }

  private async copyCaption(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.caption);
      this.elements.status.textContent = 'Caption copied. Paste it under your post.';
    } catch {
      this.elements.status.textContent = this.caption;
    }
  }
}

function canShare(file: File): boolean {
  return typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
}
