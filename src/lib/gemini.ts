import { GoogleGenAI } from '@google/genai'

// ⚠️ SOLO SERVER-SIDE. Este módulo lee AI_API_KEY de process.env y nunca
// debe importarse desde código que llegue al navegador: la key se quedaría
// expuesta en el bundle del cliente.

export const EMBEDDING_MODEL = 'gemini-embedding-001'
export const EMBEDDING_DIM = 768
export const GENERATION_MODEL = 'gemini-2.5-flash'

let _client: GoogleGenAI | null = null

// Inicialización perezosa con guard claro si falta la key.
function getClient(): GoogleGenAI {
  if (_client) return _client

  const apiKey = process.env.AI_API_KEY
  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      'AI_API_KEY no está definida. Configurá una API key real de Gemini en .env ' +
      '(AI_API_KEY=...) antes de usar el cliente de IA.',
    )
  }

  _client = new GoogleGenAI({ apiKey })
  return _client
}

// ── Retry simple ante rate limit (429 / RESOURCE_EXHAUSTED) ──────────

function esRateLimit(err: any): boolean {
  const status = err?.status ?? err?.code
  const msg = String(err?.message ?? err ?? '')
  return status === 429 || /RESOURCE_EXHAUSTED|rate limit|too many requests|quota/i.test(msg)
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function conReintento<T>(fn: () => Promise<T>, reintentos = 3, baseMs = 1000): Promise<T> {
  let ultimoError: unknown
  for (let intento = 0; intento <= reintentos; intento++) {
    try {
      return await fn()
    } catch (err) {
      ultimoError = err
      if (intento < reintentos && esRateLimit(err)) {
        // Backoff exponencial con jitter.
        const espera = baseMs * 2 ** intento + Math.floor(Math.random() * 250)
        await sleep(espera)
        continue
      }
      throw err
    }
  }
  throw ultimoError
}

// ── Embeddings ───────────────────────────────────────────────────────

/**
 * Genera el embedding de un texto con gemini-embedding-001.
 * Devuelve un vector de longitud EMBEDDING_DIM (768).
 */
export async function generarEmbedding(texto: string): Promise<number[]> {
  const ai = getClient()

  const respuesta = await conReintento(() =>
    ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: texto,
      config: { outputDimensionality: EMBEDDING_DIM },
    }),
  )

  const valores = respuesta.embeddings?.[0]?.values
  if (!valores || valores.length === 0) {
    throw new Error('La respuesta de embeddings vino vacía.')
  }
  if (valores.length !== EMBEDDING_DIM) {
    throw new Error(`Embedding con dimensión inesperada: ${valores.length} (esperado ${EMBEDDING_DIM}).`)
  }
  return valores
}

// ── Salida estructurada (JSON) ───────────────────────────────────────

/**
 * Helper genérico de salida estructurada: pide a Gemini un JSON que cumpla
 * `responseSchema` y devuelve el objeto ya parseado.
 * Base para la extracción de programas del próximo paso.
 */
export async function generarJSON<T = unknown>(
  prompt: string,
  responseSchema: unknown,
): Promise<T> {
  const ai = getClient()

  const respuesta = await conReintento(() =>
    ai.models.generateContent({
      model: GENERATION_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema as any,
      },
    }),
  )

  const texto = respuesta.text
  if (!texto) {
    throw new Error('La respuesta de generación vino vacía.')
  }

  try {
    return JSON.parse(texto) as T
  } catch {
    throw new Error(`No se pudo parsear la respuesta como JSON:\n${texto}`)
  }
}
