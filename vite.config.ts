import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

function serviceWorker(): Plugin {
  return {
    name: 'service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      const files = ['/', '/favicon.svg', '/manifest.webmanifest', ...Object.keys(bundle).map((file) => `/${file}`)];
      const source = readFileSync('sw/sw.js', 'utf8')
        .replace('self.__PRECACHE__', JSON.stringify(files.filter((file) => file !== '/index.html')))
        .replace('self.__BUILD__', JSON.stringify(Date.now().toString(36)));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  build: { target: 'es2022', assetsInlineLimit: 0 },
  plugins: [serviceWorker()],
});
