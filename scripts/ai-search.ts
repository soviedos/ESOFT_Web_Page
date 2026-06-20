/**
 * Smoke test de recuperación del RAG.
 * Ejecutar: npm run ai:search            → consulta por defecto
 *           npm run ai:search "tu consulta aquí"
 *
 * Embebe la consulta y trae los 3 chunks más cercanos por distancia coseno
 * (embedding <=> queryVector). Imprime sección + programa + distancia.
 */
import { cosineDistance } from 'drizzle-orm'
import { db, pool } from '../src/db/client.ts'
import { chunks } from '../src/db/schema.ts'
import { generarEmbedding } from '../src/lib/gemini.ts'

async function main() {
  const consulta = process.argv.slice(2).join(' ').trim() || 'quiero aprender python'
  console.log(`Consulta: "${consulta}"\n`)

  const queryVector = await generarEmbedding(consulta)
  const distancia = cosineDistance(chunks.embedding, queryVector)

  const resultados = await db.select({
    seccion: chunks.seccion,
    contenido: chunks.contenido,
    metadata: chunks.metadata,
    distancia,
  }).from(chunks).orderBy(distancia).limit(3)

  console.log('Top 3 chunks más cercanos:\n')
  resultados.forEach((r, i) => {
    const titulo = r.metadata?.titulo ?? '—'
    const dist = Number(r.distancia).toFixed(4)
    const snippet = r.contenido.replace(/\s+/g, ' ').slice(0, 90)
    console.log(`  ${i + 1}. [${r.seccion}] ${titulo}  (dist ${dist})`)
    console.log(`     ${snippet}…\n`)
  })

  console.log('✅ ai:search OK')
  await pool.end()
}

main().catch(async (err) => {
  console.error('\n❌ ai:search falló:', err?.message ?? err)
  await pool.end().catch(() => {})
  process.exit(1)
})
