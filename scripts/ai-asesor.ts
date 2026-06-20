/**
 * Smoke test del asesor RAG (recuperación + generación).
 * Ejecutar: npm run ai:asesor "tu consulta aquí"
 *           npm run ai:asesor            → consulta por defecto
 */
import { pool } from '../src/db/client.ts'
import { responderAsesor } from '../src/lib/asesor.ts'

async function main() {
  const consulta = process.argv.slice(2).join(' ').trim() || 'quiero aprender python desde cero'
  console.log(`\n🟦 Consulta: "${consulta}"\n`)

  const r = await responderAsesor(consulta)

  console.log(`tipoRecomendacion: ${r.tipoRecomendacion}`)
  console.log(`programas citados: ${r.programas.length ? r.programas.map(p => `${p.titulo} (${p.url})`).join(', ') : '— ninguno —'}`)
  console.log(`\nrespuesta:\n${r.respuesta}\n`)

  await pool.end()
}

main().catch(async (err) => {
  console.error('\n❌ ai:asesor falló:', err?.message ?? err)
  await pool.end().catch(() => {})
  process.exit(1)
})
