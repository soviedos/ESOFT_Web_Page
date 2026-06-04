import type { APIRoute } from 'astro'
import { db } from '../../db/client'
import { programas, rutas } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../lib/auth'
import { slugify } from '../../lib/utils'

async function syncRutasForPrograma(programaId: string, tipo: string) {
  const todasLasRutas = await db.select().from(rutas)
  for (const ruta of todasLasRutas) {
    const ids = (ruta.programaIds ?? []) as string[]
    const yaIncluido = ids.includes(programaId)

    const debeIncluir = ruta.slug === tipo ||
      ruta.slug.includes(tipo) ||
      (tipo === 'bachillerato' && ruta.slug === 'desarrollo-software') ||
      (tipo === 'maestria'     && (ruta.slug === 'arquitectura-software' || ruta.slug === 'inteligencia-artificial'))

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

  const { titulo, tipo, nivel, descripcion, duracionCuatrimestres } = body
  if (!titulo || !tipo || !nivel || !descripcion || !duracionCuatrimestres) {
    return new Response('Campos requeridos faltantes', { status: 422 })
  }

  const slug = slugify(titulo)
  const [nuevo] = await db.insert(programas).values({
    slug,
    titulo,
    tipo,
    nivel,
    descripcion,
    duracionCuatrimestres,
    estadisticas: body.estadisticas ?? [],
    tecnologias:  body.tecnologias  ?? [],
    objetivo:     body.objetivo     ?? null,
    perfil_egresado: body.perfil_egresado ?? null,
  }).returning()

  await syncRutasForPrograma(nuevo.id, nuevo.tipo)

  return Response.json(nuevo, { status: 201 })
}
