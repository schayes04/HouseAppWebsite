import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://house-app.com',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/invite'),
    }),
  ],
});
