import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from '@astrojs/react';

// https://astro.build/config
import sitemap from "@astrojs/sitemap";

// https://astro.build/config

// https://astro.build/config
export default defineConfig({
  site: 'https://expresiv.com.au',
  integrations: [tailwind(), react(), sitemap()]
  // integrations: [tailwind(), react(), sitemap()] adding sitemap is causing build issues. Need to come back to this later on

});