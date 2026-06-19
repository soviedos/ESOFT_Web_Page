import { db } from '../db/client'
import { bloquesContenido } from '../db/schema'
import { eq } from 'drizzle-orm'

export interface BloqueTexto {
  titulo: string | null
  cuerpo: string | null
}

// Lectura defensiva de un bloque de contenido por clave.
// Devuelve null si el bloque no existe o está inactivo, para que la página
// pueda caer a su texto por defecto.
export async function getBloque(clave: string): Promise<BloqueTexto | null> {
  const [row] = await db.select({
    titulo: bloquesContenido.titulo,
    cuerpo: bloquesContenido.cuerpo,
    activo: bloquesContenido.activo,
  }).from(bloquesContenido).where(eq(bloquesContenido.clave, clave)).limit(1)

  if (!row || !row.activo) return null
  return { titulo: row.titulo, cuerpo: row.cuerpo }
}
