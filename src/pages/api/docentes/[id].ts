import type { APIRoute } from 'astro'
import { db } from '../../../db/client'
import { docentes } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../../lib/auth'

export const GET: APIRoute = async ({ request, params }) => {
  const { id } = params
  if (!id) return new Response('ID requerido', { status: 400 })

  const autenticado = await requireAuth(request)

  const docente = await db.query.docentes.findFirst({
    where: eq(docentes.id, id),
    ...(autenticado
      ? { with: { user: { columns: { email: true, rol: true } } } }
      : {}),
  })

  if (!docente) return new Response('No encontrado', { status: 404 })
  return Response.json(docente)
}

export const PATCH: APIRoute = async ({ request, params }) => {
  const user = await requireAuth(request)
  if (!user) return new Response('No autorizado', { status: 401 })

  const { id } = params
  if (!id) return new Response('ID requerido', { status: 400 })

  const docente = await db.query.docentes.findFirst({ where: eq(docentes.id, id) })
  if (!docente) return new Response('No encontrado', { status: 404 })

  const esPropietario = docente.userId === user.id
  const esAdmin = user.rol === 'admin'
  if (!esPropietario && !esAdmin) return new Response('Prohibido', { status: 403 })

  let body: any
  try { body = await request.json() } catch {
    return new Response('JSON inválido', { status: 400 })
  }

  const camposPermitidos: Array<keyof typeof docente> = [
    'nombre', 'titulo', 'bio', 'fotoUrl', 'especialidades', 'linkedin',
  ]
  if (esAdmin) camposPermitidos.push('activo')

  const update: Record<string, any> = { updatedAt: new Date() }
  for (const campo of camposPermitidos) {
    if (campo in body) update[campo] = body[campo]
  }

  const [actualizado] = await db.update(docentes)
    .set(update)
    .where(eq(docentes.id, id))
    .returning()

  return Response.json(actualizado)
}
