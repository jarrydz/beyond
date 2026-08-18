import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// Set by the GitHub Actions workflow to `/${repo}/` so asset URLs resolve on
// Pages. Locally it falls back to `/`.
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg', 'icon-maskable.svg'],
      manifest: {
        name: 'Beyond',
        short_name: 'Beyond',
        description: 'Your retreat, continued.',
        theme_color: '#12262B',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Don't precache the dev-only files; keep the runtime bundle slim.
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        // The SPA navigation fallback otherwise serves index.html (the app shell)
        // for any navigation — including direct links to real files like the deck
        // PDF. Deny-list those so they pass through to the network.
        navigateFallbackDenylist: [/\.pdf$/i],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
