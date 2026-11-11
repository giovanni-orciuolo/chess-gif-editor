import type { Players } from '../render/painter';
import { shareCaption, shareLinks } from './shareLinks';

export interface ShareElements {
  fileButton: HTMLButtonElement;
  copyButton: HTMLButtonElement;
  links: HTMLElement;
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
    this.elements.fileButton.hidden = !canShare(file);
    this.elements.fileButton.textContent = `Share ${file.type === 'image/gif' ? 'GIF' : 'video'}`;
    this.elements.links.replaceChildren(...shareLinks(players).map(linkButton));
    this.elements.status.textContent = '';
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

function linkButton(link: { name: string; href: string }): HTMLAnchorElement {
  return Object.assign(document.createElement('a'), {
    href: link.href,
    textContent: link.name,
    target: '_blank',
    rel: 'noopener',
    className: 'share-link',
  });
}
