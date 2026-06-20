import { cosineDistance, eq, and, inArray } from 'drizzle-orm'
import { Type } from '@google/genai'
import { db } from '../db/client'
import { chunks, programas } from '../db/schema'
import { generarEmbedding, generarJSON } from './gemini'

// ⚠️ SOLO SERVER-SIDE (usa la capa de IA y la BD).

export interface MensajeHistorial {
  rol: string
  texto: string
}

export interface ProgramaCitado {
  slug: string
  titulo: string
  url: string
}

export type TipoRecomendacion = 'establecida' | 'transversal' | 'ninguna'

export interface RespuestaAsesor {
  respuesta: string
  programas: ProgramaCitado[]
  tipoRecomendacion: TipoRecomendacion
}

const TOP_K = 8

const SISTEMA = `Sos el asesor de admisiones de ESOFT (Escuela de Ingeniería del Software, Universidad CENFOTEC).
Orientás a prospectos a elegir una ruta de conocimiento establecida o, si su interés cruza áreas, a componer una ruta transversal combinando programas.

Reglas:
- Respondé SOLO con base en el CONTEXTO recuperado. No inventes programas, cursos, precios ni datos.
- Si el contexto no cubre la consulta, decilo con honestidad y derivá a "Solicitar información". No fuerces una recomendación.
- Citá únicamente los slugs de programa que aparezcan en el CONTEXTO; nunca inventes un slug.
- Tono claro y cálido, en español de Costa Rica. Sos inteligencia aumentada: orientás y citás, no reemplazás la decisión del prospecto.
- tipoRecomendacion: 'establecida' si recomendás un programa puntual del contexto; 'transversal' si proponés combinar varios programas; 'ninguna' si el contexto no aplica a la consulta.
- El campo "programas" debe contener solo slugs presentes en el contexto (vacío si tipoRecomendacion es 'ninguna').`

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    respuesta: {
      type: Type.STRING,
      description: 'Respuesta para el prospecto, en español, basada solo en el contexto.',
    },
    programas: {
      type: Type.ARRAY,
      description: 'Slugs de programa citados, exclusivamente del contexto recuperado.',
      items: { type: Type.STRING },
    },
    tipoRecomendacion: {
      type: Type.STRING,
      enum: ['establecida', 'transversal', 'ninguna'],
    },
  },
  required: ['respuesta', 'programas', 'tipoRecomendacion'],
}

interface ChunkRecuperado {
  contenido: string
  metadata: { programaSlug?: string; titulo?: string; modalidad?: string; area?: string | null } | null
}

function construirContexto(recuperados: ChunkRecuperado[]): string {
  if (recuperados.length === 0) return '(no se recuperó ningún fragmento relevante)'
  return recuperados.map((r, i) => {
    const m = r.metadata ?? {}
    const meta = [
      `slug: ${m.programaSlug ?? '—'}`,
      `modalidad: ${m.modalidad ?? '—'}`,
      m.area ? `área: ${m.area}` : null,
    ].filter(Boolean).join(', ')
    return `[${i + 1}] Programa: ${m.titulo ?? '—'} (${meta})\n${r.contenido}`
  }).join('\n\n')
}

/**
 * Núcleo del asesor RAG: recupera chunks por distancia coseno, arma el prompt
 * y genera una respuesta estructurada citando solo programas del contexto.
 */
export async function responderAsesor(
  mensaje: string,
  historial: MensajeHistorial[] = [],
): Promise<RespuestaAsesor> {
  // 1) Recuperación por distancia coseno.
  const queryVector = await generarEmbedding(mensaje)
  const distancia = cosineDistance(chunks.embedding, queryVector)
  const recuperados = await db.select({
    contenido: chunks.contenido,
    metadata: chunks.metadata,
  }).from(chunks).orderBy(distancia).limit(TOP_K)

  // 2) Prompt: sistema + contexto + (historial) + consulta.
  const contexto = construirContexto(recuperados as ChunkRecuperado[])
  const histTxt = historial.length > 0
    ? `\n\nHISTORIAL DE LA CONVERSACIÓN:\n${historial.map(h => `${h.rol}: ${h.texto}`).join('\n')}`
    : ''
  const prompt =
    `INSTRUCCIONES DEL SISTEMA:\n${SISTEMA}\n\n` +
    `CONTEXTO RECUPERADO:\n${contexto}${histTxt}\n\n` +
    `CONSULTA DEL PROSPECTO:\n${mensaje}\n\n` +
    `Respondé en JSON según el schema.`

  // 3) Generación estructurada.
  const salida = await generarJSON<{
    respuesta: string
    programas: string[]
    tipoRecomendacion: string
  }>(prompt, RESPONSE_SCHEMA)

  // 4) Resolver slugs contra la BD (descartar inexistentes / inactivos),
  //    preservando el orden propuesto por el modelo.
  const slugs = Array.isArray(salida.programas)
    ? [...new Set(salida.programas.filter((s): s is string => typeof s === 'string' && s.length > 0))]
    : []

  let citados: ProgramaCitado[] = []
  if (slugs.length > 0) {
    const filas = await db.select({ slug: programas.slug, titulo: programas.titulo })
      .from(programas)
      .where(and(inArray(programas.slug, slugs), eq(programas.activo, true)))
    const porSlug = new Map(filas.map(f => [f.slug, f]))
    citados = slugs
      .map(s => porSlug.get(s))
      .filter((f): f is { slug: string; titulo: string } => Boolean(f))
      .map(f => ({ slug: f.slug, titulo: f.titulo, url: `/programas/${f.slug}` }))
  }

  const tipoRecomendacion: TipoRecomendacion =
    salida.tipoRecomendacion === 'establecida' || salida.tipoRecomendacion === 'transversal'
      ? salida.tipoRecomendacion
      : 'ninguna'

  return {
    respuesta: typeof salida.respuesta === 'string' ? salida.respuesta : '',
    programas: citados,
    tipoRecomendacion,
  }
}
