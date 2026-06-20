/**
 * Extrae programas de un documento Markdown y muestra un resumen.
 * Ejecutar: npm run ai:extraer fixtures/ejemplo-ingesta.md
 */
import { readFile } from 'node:fs/promises'
import { extraerProgramas } from '../src/lib/ingesta.ts'

async function main() {
  const archivo = process.argv[2]
  if (!archivo) {
    console.error('Uso: npm run ai:extraer <archivo.md>')
    process.exit(1)
  }

  const markdown = await readFile(archivo, 'utf8')
  console.log(`\nExtrayendo programas de "${archivo}"…\n`)

  const programas = await extraerProgramas(markdown)

  console.log(`✅ ${programas.length} programa(s) extraído(s):\n`)
  programas.forEach((p, i) => {
    const u = p.plan?.unidades?.length ?? 0
    const c = p.plan?.competencias?.length ?? 0
    console.log(`  ${i + 1}. ${p.titulo}`)
    console.log(`     modalidad: ${p.modalidad} · unidades: ${u} · competencias: ${c}`)

    // Detalle breve por unidad (para verificación).
    p.plan?.unidades?.forEach((un) => {
      const horas = [un.horasLectivas, un.horasPracticas, un.horasEstudio]
        .every(h => h == null)
        ? ''
        : ` · HL ${un.horasLectivas ?? '—'}/HP ${un.horasPracticas ?? '—'}/HE ${un.horasEstudio ?? '—'}`
      const cr = un.creditos != null ? ` · ${un.creditos} cr` : ''
      const cod = un.codigo ? `[${un.codigo}] ` : ''
      const ubic = un.cuatrimestre != null ? ` (cuatri ${un.cuatrimestre})` : un.secuencia != null ? ` (seq ${un.secuencia})` : ''
      console.log(`        - ${cod}${un.nombre}${ubic}${horas}${cr}`)
    })
    p.plan?.competencias?.forEach((co) => {
      const sfia = co.sfiaCodigo ? ` [SFIA ${co.sfiaCodigo}${co.sfiaNivel != null ? `-${co.sfiaNivel}` : ''}]` : ''
      const ref = co.unidad != null ? ` → unidad ${co.unidad}` : ' → programa'
      console.log(`        ◆ ${co.nombre}${sfia}${ref}`)
    })
    console.log('')
  })
}

main().catch((err) => {
  console.error('\n❌ ai:extraer falló:', err?.message ?? err)
  process.exit(1)
})
