import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  output:  'server',
  adapter: node({ mode: 'standalone' }),
  site:    process.env.PUBLIC_SITE_URL ?? 'https://esoft.ucenfotec.ac.cr',
  integrations: [
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    host: '0.0.0.0',
    port: 4321,
  },
})