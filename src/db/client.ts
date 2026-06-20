import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// DATABASE_URL: en Astro (SSR/dev) se valida y se lee vía astro:env/server.
// En scripts ejecutados con tsx (db:seed, ai:reindex, etc.) `astro:env` no
// existe, así que caemos a process.env.DATABASE_URL.
async function resolverDatabaseUrl(): Promise<string> {
  try {
    const env = await import('astro:env/server')
    return env.DATABASE_URL
  } catch {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL no está definida (ni astro:env ni process.env).')
    return url
  }
}

export const pool = new Pool({
  connectionString: await resolverDatabaseUrl(),
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

export const db = drizzle(pool, { schema })

const shutdown = () => pool.end().finally(() => process.exit(0))
process.once('SIGTERM', shutdown)
process.once('SIGINT',  shutdown)
