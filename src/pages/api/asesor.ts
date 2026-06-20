import type { APIRoute } from 'astro'
import { responderAsesor, type MensajeHistorial } from '../../lib/asesor'

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

// ── Rate-limit básico por IP (ventana deslizante) ────────────────────
// En memoria: sirve para una sola instancia. Con varias instancias detrás de
// un balanceador haría falta un store compartido (p. ej. Redis).
const RATE_LIMIT = 15        // peticiones permitidas
const RATE_WINDOW_MS = 60_000 // por ventana (1 minuto)
const accesosPorIp = new Map<string, number[]>()

function dentroDelLimite(ip: string): boolean {
  const ahora = Date.now()
  const previos = (accesosPorIp.get(ip) ?? []).filter(t => ahora - t < RATE_WINDOW_MS)
  if (previos.length >= RATE_LIMIT) {
    accesosPorIp.set(ip, previos)
    return false
  }
  previos.push(ahora)
  accesosPorIp.set(ip, previos)
  // Limpieza oportunista para que el Map no crezca sin límite.
  if (accesosPorIp.size > 5000) {
    for (const [k, v] of accesosPorIp) {
      if (v.every(t => ahora - t >= RATE_WINDOW_MS)) accesosPorIp.delete(k)
    }
  }
  return true
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = clientAddress
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'desconocida'

  if (!dentroDelLimite(ip)) {
    return json(
      { error: 'Estás enviando consultas muy seguido. Esperá un momento y volvé a intentar.' },
      429,
    )
  }

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
