import * as jose from 'jose'

export interface SessionUser {
  id: string; email: string; rol: 'admin' | 'docente'
}

// Lazy para que el check ocurra en tiempo de request (no de inicialización del módulo).
// Necesario en Astro 6 SSR: el module runner de Vite no tiene process.env del .env
// disponible en el worker al evaluar el módulo, pero sí en cada request handler.
function getSecret(): Uint8Array {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error('SESSION_SECRET no está definida. Revisa tu .env')
  return new TextEncoder().encode(s)
}

export async function signToken(user: SessionUser): Promise<string> {
  return new jose.SignJWT({ sub: user.id, email: user.email, rol: user.rol })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function requireAuth(
  request: Request,
  rolRequerido?: 'admin' | 'docente'
): Promise<SessionUser | null> {
  try {
    const cookieHeader = request.headers.get('cookie') ?? ''
    const match = cookieHeader.match(/esoft_session=([^;]+)/)
    const authHeader = request.headers.get('authorization') ?? ''
    const token = match?.[1] ?? (authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null)
    if (!token) return null
    const { payload } = await jose.jwtVerify(token, getSecret())
    const user: SessionUser = {
      id: payload.sub as string,
      email: payload.email as string,
      rol: payload.rol as 'admin' | 'docente',
    }
    if (rolRequerido === 'admin' && user.rol !== 'admin') return null
    return user
  } catch { return null }
}
