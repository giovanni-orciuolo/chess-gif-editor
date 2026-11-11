export interface BoardColors {
  light: string;
  dark: string;
  highlight: string;
}

export const boardThemes = {
  green: { light: '#ebecd0', dark: '#739552', highlight: '#f5f682' },
  brown: { light: '#f0d9b5', dark: '#b58863', highlight: '#cdd26a' },
  blue: { light: '#dee3e6', dark: '#8ca2ad', highlight: '#9bc700' },
  slate: { light: '#d9d9d9', dark: '#7d8796', highlight: '#e6c35c' },
  purple: { light: '#efefef', dark: '#8877b7', highlight: '#e8d26b' },
} satisfies Record<string, BoardColors>;

export type BoardThemeName = keyof typeof boardThemes;
