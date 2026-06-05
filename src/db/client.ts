import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida. Revisa tu .env')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

export const db = drizzle(pool, { schema })
export { pool }

const shutdown = () => pool.end().finally(() => process.exit(0))
process.once('SIGTERM', shutdown)
process.once('SIGINT',  shutdown)
