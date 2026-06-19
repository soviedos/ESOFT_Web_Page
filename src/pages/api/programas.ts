import type { APIRoute } from 'astro'
import { db } from '../../db/client'
import { programas, rutas } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../lib/auth'
import { slugify } from '../../lib/utils'

const MODALIDADES_VALIDAS = ['cuatrimestral', 'path', 'curso_360', 'curso_continuo'] as const
const NIVELES_VALIDOS = ['tecnico', 'bachillerato', 'maestria'] as const

async function syncRutasForPrograma(programaId: string, modalidad: string) {
  const todasLasRutas = await db.select().from(rutas)
  for (const ruta of todasLasRutas) {
    const ids = (ruta.programaIds ?? []) as string[]
    const yaIncluido = ids.includes(programaId)

    const debeIncluir = ruta.slug === modalidad || ruta.slug.includes(modalidad)

    if (debeIncluir && !yaIncluido) {
      await db.update(rutas)
        .set({ programaIds: [...ids, programaId], updatedAt: new Date() })
        .where(eq(rutas.id, ruta.id))
    }
  }
}

export const GET: APIRoute = async () => {
  const lista = await db.select().from(programas).where(eq(programas.activo, true))
  return Response.json(lista)
}

export const POST: APIRoute = async ({ request }) => {
  const user = await requireAuth(request, 'admin')
  if (!user) return new Response('No autorizado', { status: 401 })

  let body: any
  try { body = await request.json() } catch {
    return new Response('JSON inválido', { status: 400 })
  }

  const { titulo, modalidad, nivel, descripcion } = body
  if (!titulo || !modalidad || !descripcion) {
    return new Response('Campos requeridos faltantes (titulo, modalidad, descripcion)', { status: 422 })
  }

  if (!MODALIDADES_VALIDAS.includes(modalidad)) {
    return new Response(`modalidad inválida. Valores aceptados: ${MODALIDADES_VALIDAS.join(', ')}`, { status: 422 })
  }
  if (nivel && !NIVELES_VALIDOS.includes(nivel)) {
    return new Response(`nivel inválido. Valores aceptados: ${NIVELES_VALIDOS.join(', ')}`, { status: 422 })
  }

  const slug = slugify(titulo)

  try {
    const [nuevo] = await db.insert(programas).values({
      slug,
      titulo,
      modalidad,
      nivel:                 nivel ?? null,
      descripcion,
      duracionCuatrimestres: body.duracionCuatrimestres ?? null,
      totalMicrociclos:      body.totalMicrociclos      ?? null,
      duracionHoras:         body.duracionHoras         ?? null,
      areaCurricularId:      body.areaCurricularId      ?? null,
      prerequisitoId:        body.prerequisitoId        ?? null,
      nivelCredencial:       body.nivelCredencial       ?? null,
      microcredencial:       body.microcredencial       ?? null,
      badgeUrl:              body.badgeUrl              ?? null,
      estadisticas: body.estadisticas ?? [],
      tecnologias:  body.tecnologias  ?? [],
      objetivo:       body.objetivo        ?? null,
      perfilEgresado: body.perfilEgresado  ?? null,
    }).returning()

    await syncRutasForPrograma(nuevo.id, nuevo.modalidad)
    return Response.json(nuevo, { status: 201 })
  } catch (err: any) {
    if (err?.code === '23505') {
      return new Response(`El slug "${slug}" ya existe. Cambia el título.`, { status: 409 })
    }
    throw err
  }
}
