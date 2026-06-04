import type { APIRoute } from 'astro'

export const POST: APIRoute = async () => {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': 'esoft_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
    },
  })
}
