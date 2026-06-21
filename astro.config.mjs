// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// Public pages are statically prerendered (output: 'static').
// Only the dashboard + API routes opt into on-demand SSR via
// `export const prerender = false`, served by the Cloudflare adapter.
export default defineConfig({
  site: 'https://lovebirdweddings.de',
  output: 'static',
  adapter: cloudflare({ imageService: 'compile' }),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/dashboard') && !page.includes('/api'),
    }),
  ],
});
