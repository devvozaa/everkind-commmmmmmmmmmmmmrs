// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: true,
      allowedHosts: ['.manus.computer']
    }
  },
  adapter: vercel({
    webAnalytics: { enabled: true }
  })
});