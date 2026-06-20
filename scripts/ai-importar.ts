/**
 * Importa programas desde un documento Markdown: extrae y persiste como
 * BORRADOR con su plan. Ejecutar: npm run ai:importar fixtures/ejemplo-ingesta.md
 */
import { readFile } from 'node:fs/promises'
import { pool } from '../src/db/client.ts'
import { extraerProgramas, mapearYPersistir } from '../src/lib/ingesta.ts'

async function main() {
  const archivo = process.argv[2]
  if (!archivo) {
    console.error('Uso: npm run ai:importar <archivo.md>')
    process.exit(1)
  }

  const markdown = await readFile(archivo, 'utf8')
  console.log(`\nExtrayendo e importando programas de "${archivo}"…\n`)

  const extraidos = await extraerProgramas(markdown)
  console.log(`Extraídos ${extraidos.length} programa(s). Persistiendo como BORRADOR…\n`)

  for (const ex of extraidos) {
    const r = await mapearYPersistir(ex)
    const estado = r.ok ? `OK · /${r.slug}` : 'FALLÓ'
    console.log(`  ${r.ok ? '✓' : '✗'} ${r.titulo} — ${estado}`)
    for (const w of r.warnings) console.log(`      ⚠ ${w}`)
  }

  console.log('')
  await pool.end()
}

main().catch(async (err) => {
  console.error('\n❌ ai:importar falló:', err?.message ?? err)
  await pool.end().catch(() => {})
  process.exit(1)
})
