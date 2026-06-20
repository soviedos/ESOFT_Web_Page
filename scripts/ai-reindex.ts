/**
 * Reindexa (vectoriza) todos los programas activos para el RAG.
 * Ejecutar: npm run ai:reindex   (requiere AI_API_KEY y DATABASE_URL en .env)
 */
import { eq } from 'drizzle-orm'
import { db, pool } from '../src/db/client.ts'
import { programas } from '../src/db/schema.ts'
import { vectorizarPrograma } from '../src/lib/embeddings.ts'

async function main() {
  const activos = await db.select({ id: programas.id, slug: programas.slug })
    .from(programas).where(eq(programas.activo, true))

  console.log(`Reindexando ${activos.length} programas activos…\n`)

  let total = 0
  for (const p of activos) {
    const n = await vectorizarPrograma(p.id)
    total += n
    console.log(`  ✓ ${p.slug.padEnd(40)} ${n} chunks`)
  }

  console.log(`\n✅ ai:reindex OK — ${total} chunks en total.`)
  await pool.end()
}

main().catch(async (err) => {
  console.error('\n❌ ai:reindex falló:', err?.message ?? err)
  await pool.end().catch(() => {})
  process.exit(1)
})
