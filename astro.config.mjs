import { defineConfig, envField } from 'astro/config'
import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  output:  'server',
  adapter: node({ mode: 'standalone' }),
  site:    process.env.PUBLIC_SITE_URL ?? 'https://esoft.ucenfotec.ac.cr',

  // Variables secretas del servidor — disponibles via astro:env/server
  // en todos los contextos SSR (pages, API routes, middleware, componentes)
  env: {
    schema: {
      DATABASE_URL:   envField.string({ context: 'server', access: 'secret' }),
      SESSION_SECRET: envField.string({ context: 'server', access: 'secret' }),
    },
  },

  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    host: '0.0.0.0',
    port: 4321,
  },
})
