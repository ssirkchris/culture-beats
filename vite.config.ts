import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [VitePWA({
    strategies: 'injectManifest',
    srcDir: 'src',
    filename: 'sw.ts',
    injectRegister: false,
    injectManifest: { globPatterns: ['**/*.{js,css,html,png,webmanifest}'] },
    manifest: {
      id: './', start_url: './', scope: './', display: 'standalone',
      name: 'CULTURE//BEATS', short_name: 'CULTURE//BEATS', lang: 'en',
      theme_color: '#1c2025', background_color: '#1c2025',
      icons: [192, 512].map(size => ({
        src: `icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png', purpose: 'any',
      })),
    },
  })],
});
