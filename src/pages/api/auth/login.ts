import type { APIRoute } from 'astro'
import { db } from '../../../db/client'
import { users } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { signToken } from '../../../lib/auth'
import { verifyPassword } from '../../../lib/password'

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 días, igual que el JWT

function loginError(next: string) {
  return new Response(null, {
    status: 302,
    headers: { Location: `/login?error=invalid&next=${encodeURIComponent(next)}` },
  })
}

function safeRedirect(next: string): string {
  try {
    const url = new URL(next, 'http://localhost')
    // Solo se permiten rutas relativas del mismo origen
    return url.pathname + url.search
  } catch {
    return '/'
  }
}

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData().catch(() => null)
  if (!form) return new Response('Datos inválidos', { status: 400 })

  const email    = (form.get('email')    as string | null)?.trim().toLowerCase() ?? ''
  const password = (form.get('password') as string | null) ?? ''
  const next     = safeRedirect((form.get('next') as string | null) ?? '/')

  if (!email || !password) return loginError(next)

  const user = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (!user) return loginError(next)

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return loginError(next)

  const token = await signToken({ id: user.id, email: user.email, rol: user.rol })

  const secure = import.meta.env.PROD ? '; Secure' : ''
  const cookie = `esoft_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}${secure}`

  return new Response(null, {
    status: 302,
    headers: { Location: next, 'Set-Cookie': cookie },
  })
}
