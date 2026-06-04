import * as jose from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'dev-secret'
)

export interface SessionUser {
  id: string; email: string; rol: 'admin' | 'docente'
}

export async function signToken(user: SessionUser): Promise<string> {
  return new jose.SignJWT({ sub: user.id, email: user.email, rol: user.rol })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
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
    const { payload } = await jose.jwtVerify(token, SECRET)
    const user: SessionUser = {
      id: payload.sub as string,
      email: payload.email as string,
      rol: payload.rol as 'admin' | 'docente',
    }
    if (rolRequerido === 'admin' && user.rol !== 'admin') return null
    return user
  } catch { return null }
}
