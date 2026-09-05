import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
import sitemap from "@astrojs/sitemap";

// https://astro.build/config

// https://astro.build/config

// https://astro.build/config
export default defineConfig({
  site: 'https://expresiv.com.au',
  output: 'server', // Enable server-side rendering for API routes
  adapter: node({
    mode: 'standalone'
  }),
  prefetch: {
    prefetchAll: true,
  },
  integrations: [tailwind({ applyBaseStyles: false }), react(), sitemap({filter: (page) => !['/index.backup/', '/aceternity-cards/', '/single-page/', '/work-single/', '/moving/'].includes(new URL(page).pathname)})]
  // Legacy layouts load Tailwind explicitly; agency pages use their own stylesheet.
});
