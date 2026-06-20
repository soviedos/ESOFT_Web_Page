import type { APIRoute } from 'astro'
import { responderAsesor, type MensajeHistorial } from '../../lib/asesor'

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export const POST: APIRoute = async ({ request }) => {
  let body: any
  try {
    body = await request.json()
  } catch {
    return json({ error: 'JSON inválido.' }, 400)
  }

  const mensaje = typeof body?.mensaje === 'string' ? body.mensaje.trim() : ''
  if (!mensaje) {
    return json({ error: 'Falta el campo "mensaje".' }, 422)
  }

  // Historial opcional (multi-turno futuro): se sanea y se acota.
  const historial: MensajeHistorial[] = Array.isArray(body?.historial)
    ? body.historial
        .filter((h: any) => h && typeof h.rol === 'string' && typeof h.texto === 'string')
        .map((h: any) => ({ rol: h.rol, texto: h.texto }))
        .slice(-10)
    : []

  try {
    const resultado = await responderAsesor(mensaje, historial)
    return json(resultado, 200)
  } catch (err: any) {
    // Sin stack traces al cliente; log server-side para diagnóstico.
    console.error('[asesor] error:', err?.message ?? err)
    return json(
      { error: 'El asesor no está disponible en este momento. Probá de nuevo en unos minutos o usá "Solicitar información".' },
      503,
    )
  }
}
