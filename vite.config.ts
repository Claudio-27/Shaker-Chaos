import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { localArtSources } from './scripts/dev-art-sources.mjs';

export default defineConfig({
  base: './',
  plugins: [react(), localArtSources()],
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
});
