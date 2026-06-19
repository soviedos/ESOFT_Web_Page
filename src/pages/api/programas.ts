import type { APIRoute } from 'astro'
import { db } from '../../db/client'
import { programas } from '../../db/schema'
import { eq } from 'drizzle-orm'

// API pública de solo lectura. El alta/edición de programas pasa por el
// camino server-side del admin (lib/programa-write), no por esta ruta.
export const GET: APIRoute = async () => {
  const lista = await db.select().from(programas).where(eq(programas.activo, true))
  return Response.json(lista)
}
