import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://house-app.com',
  output: 'static',
  // Preserve HTML whitespace behavior from before Astro 7.
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/invite'),
    }),
  ],
});
