import { eq, asc } from 'drizzle-orm'
import { db } from '../db/client'
import { programas, cursos, competencias, areasCurriculares, chunks, type ChunkMetadata } from '../db/schema'
import type { Programa, Curso, Competencia } from './types'
import { generarEmbedding } from './gemini'
import { modalidadLabel, nivelLabel, nivelCredencialLabel } from './labels'

// ⚠️ SOLO SERVER-SIDE (usa la capa de IA y la BD).

export interface ChunkInput {
  seccion: string
  contenido: string
  metadata: ChunkMetadata
}

const tipoUnidadLabel: Record<string, string> = {
  curso: 'Curso',
  microciclo: 'Microciclo',
  modulo_360: 'Módulo',
}

// Arma los chunks de texto (con metadata) de un programa. Función pura.
export function chunkPrograma(
  programa: Programa,
  cursosDelPrograma: Curso[],
  competenciasDelPrograma: Competencia[],
  areaNombre: string | null = null,
): ChunkInput[] {
  const metadata: ChunkMetadata = {
    programaSlug: programa.slug,
    titulo: programa.titulo,
    modalidad: programa.modalidad,
    area: areaNombre,
  }

  const resultado: ChunkInput[] = []
  const cursoPorId = new Map(cursosDelPrograma.map(c => [c.id, c]))

  // 1) Resumen del programa.
  const resumen: string[] = [programa.titulo]
  resumen.push(`Modalidad: ${modalidadLabel[programa.modalidad] ?? programa.modalidad}.`)
  if (programa.nivel) resumen.push(`Nivel: ${nivelLabel[programa.nivel] ?? programa.nivel}.`)
  if (programa.nivelCredencial) resumen.push(`Credencial: ${nivelCredencialLabel[programa.nivelCredencial] ?? programa.nivelCredencial}.`)
  if (areaNombre) resumen.push(`Área: ${areaNombre}.`)
  resumen.push(programa.descripcion)
  if (programa.objetivo) resumen.push(`Objetivo: ${programa.objetivo}`)
  if (programa.perfilEgresado) resumen.push(`Perfil de egreso: ${programa.perfilEgresado}`)
  const tecnologias = (programa.tecnologias ?? []) as string[]
  if (tecnologias.length) resumen.push(`Tecnologías: ${tecnologias.join(', ')}.`)
  resultado.push({ seccion: 'resumen', contenido: resumen.join('\n'), metadata })

  // 2) Un chunk por unidad (curso / microciclo / módulo).
  for (const u of cursosDelPrograma) {
    const label = tipoUnidadLabel[u.tipo] ?? 'Unidad'
    const partes = [`${label} del programa "${programa.titulo}": ${u.nombre}.`]
    if (u.codigo) partes.push(`Código: ${u.codigo}.`)
    if (u.descripcion) partes.push(u.descripcion)
    resultado.push({ seccion: 'unidad', contenido: partes.join(' '), metadata })
  }

  // 3) Un chunk por competencia (con contexto de su unidad).
  for (const c of competenciasDelPrograma) {
    const partes = [`Competencia del programa "${programa.titulo}": ${c.nombre}.`]
    if (c.descripcion) partes.push(c.descripcion)
    if (c.sfiaCodigo) partes.push(`Código SFIA: ${c.sfiaCodigo}${c.sfiaNivel != null ? ` nivel ${c.sfiaNivel}` : ''}.`)
    if (c.microcredencial) partes.push(`Microcredencial: ${c.microcredencial}.`)
    if (c.cursoId) {
      const u = cursoPorId.get(c.cursoId)
      if (u) partes.push(`Forma parte del ${(tipoUnidadLabel[u.tipo] ?? 'unidad').toLowerCase()} "${u.nombre}".`)
    }
    resultado.push({ seccion: 'competencia', contenido: partes.join(' '), metadata })
  }

  return resultado
}

/**
 * Carga programa + cursos + competencias, arma los chunks, los embebe con
 * generarEmbedding y reemplaza los chunks del programa (borra + inserta) en
 * una transacción. Devuelve la cantidad de chunks generados.
 */
export async function vectorizarPrograma(programaId: string): Promise<number> {
  const programa = await db.query.programas.findFirst({ where: eq(programas.id, programaId) })
  if (!programa) throw new Error(`Programa ${programaId} no encontrado.`)

  const cursosRows = await db.select().from(cursos)
    .where(eq(cursos.programaId, programaId))
    .orderBy(asc(cursos.secuencia), asc(cursos.orden))

  const compRows = await db.select().from(competencias)
    .where(eq(competencias.programaId, programaId))
    .orderBy(asc(competencias.orden))

  let areaNombre: string | null = null
  if (programa.areaCurricularId) {
    const [a] = await db.select({ nombre: areasCurriculares.nombre })
      .from(areasCurriculares).where(eq(areasCurriculares.id, programa.areaCurricularId)).limit(1)
    areaNombre = a?.nombre ?? null
  }

  const entradas = chunkPrograma(programa, cursosRows, compRows, areaNombre)

  // Los embeddings son llamadas de red: se generan ANTES de la transacción
  // para no mantenerla abierta durante el I/O.
  const conVector: (ChunkInput & { embedding: number[] })[] = []
  for (const ch of entradas) {
    const embedding = await generarEmbedding(ch.contenido)
    conVector.push({ ...ch, embedding })
  }

  // Reemplazo atómico de los chunks del programa.
  await db.transaction(async (tx) => {
    await tx.delete(chunks).where(eq(chunks.programaId, programaId))
    if (conVector.length > 0) {
      await tx.insert(chunks).values(conVector.map(c => ({
        programaId,
        seccion: c.seccion,
        contenido: c.contenido,
        embedding: c.embedding,
        metadata: c.metadata,
      })))
    }
  })

  return conVector.length
}
