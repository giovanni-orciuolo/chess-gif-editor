import { boardThemes, type BoardThemeName } from '../render/theme';
import type { Settings } from './settings';

type Field = HTMLInputElement | HTMLSelectElement;

const notSettings = new Set(['pgn', 'pgnFile', 'theme']);

export class SettingsForm {
  constructor(private readonly form: HTMLFormElement) {
    this.themeSelect.addEventListener('change', () => this.applyTheme());
  }

  read(): Settings {
    const settings: Record<string, unknown> = {};
    for (const field of this.fields()) {
      if (field instanceof HTMLInputElement && field.type === 'radio' && !field.checked) continue;
      assign(settings, field.name, valueOf(field));
    }
    return settings as unknown as Settings;
  }

  write(settings: Settings): void {
    for (const field of this.fields()) write(field, lookup(settings, field.name));
    this.themeSelect.value = themeMatching(settings);
  }

  onChange(listener: () => void): void {
    this.form.addEventListener('input', (event) => {
      if (isColor(event.target)) this.themeSelect.value = 'custom';
      if (!notSettings.has((event.target as Field).name)) listener();
    });
    this.themeSelect.addEventListener('change', listener);
  }

  private applyTheme(): void {
    const name = this.themeSelect.value;
    if (!Object.hasOwn(boardThemes, name)) return;
    const colors = boardThemes[name as BoardThemeName];
    for (const [key, color] of Object.entries(colors)) {
      (this.form.elements.namedItem(`look.colors.${key}`) as HTMLInputElement).value = color;
    }
  }

  private get themeSelect(): HTMLSelectElement {
    return this.form.elements.namedItem('theme') as HTMLSelectElement;
  }

  private fields(): Field[] {
    const all = [...this.form.elements, ...document.querySelectorAll(`[form="${this.form.id}"]`)];
    return all.filter((element): element is Field => isField(element) && !notSettings.has(element.name));
  }
}

function isField(element: Element): element is Field {
  return (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) && Boolean(element.name);
}

function isColor(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement && target.type === 'color';
}

function valueOf(field: Field): unknown {
  if (field instanceof HTMLInputElement && field.type === 'checkbox') return field.checked;
  if (field instanceof HTMLInputElement && field.type === 'number') return field.valueAsNumber || 0;
  if (field.name === 'fps') return Number(field.value);
  return field.value;
}

function write(field: Field, value: unknown): void {
  if (field instanceof HTMLInputElement && field.type === 'checkbox') return void (field.checked = Boolean(value));
  if (field instanceof HTMLInputElement && field.type === 'radio') return void (field.checked = field.value === value);
  field.value = String(value);
}

function assign(target: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  const last = keys.pop()!;
  const parent = keys.reduce((node, key) => (node[key] ??= {}) as Record<string, unknown>, target);
  parent[last] = value;
}

function lookup(source: object, path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown>)?.[key], source);
}

function themeMatching(settings: Settings): string {
  const { colors } = settings.look;
  const match = Object.entries(boardThemes).find(([, theme]) => JSON.stringify(theme) === JSON.stringify(colors));
  return match?.[0] ?? 'custom';
}
