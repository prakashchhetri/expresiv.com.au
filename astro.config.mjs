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
  integrations: [tailwind(), react(), sitemap()]
  // integrations: [tailwind(), react(), sitemap()] adding sitemap is causing build issues. Need to come back to this later on
});