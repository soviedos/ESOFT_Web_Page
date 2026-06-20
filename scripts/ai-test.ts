/**
 * Verificación del cliente Gemini (Fase 3, pieza 2).
 * Ejecutar: npm run ai:test   (requiere AI_API_KEY real en .env)
 *
 *  (a) generarJSON trivial → extrae un nombre de una frase e imprime el objeto.
 *  (b) generarEmbedding('hola mundo') → imprime la longitud del vector (768).
 */
import { Type } from '@google/genai'
import { generarEmbedding, generarJSON, EMBEDDING_DIM } from '../src/lib/gemini.ts'

async function main() {
  console.log('① generarJSON — extracción estructurada')
  const schema = {
    type: Type.OBJECT,
    properties: {
      nombre: { type: Type.STRING, description: 'El nombre de la persona mencionada' },
    },
    required: ['nombre'],
  }
  const obj = await generarJSON<{ nombre: string }>(
    'Extraé el nombre de la persona de esta frase: "Ayer María presentó el proyecto a la clase."',
    schema,
  )
  console.log('   →', obj)

  console.log('\n② generarEmbedding — vector de "hola mundo"')
  const vector = await generarEmbedding('hola mundo')
  console.log('   → longitud del vector:', vector.length, vector.length === EMBEDDING_DIM ? '✓' : '✗ (esperado 768)')
  console.log('   → primeros 5 valores:', vector.slice(0, 5))

  console.log('\n✅ ai:test OK')
}

main().catch((err) => {
  console.error('\n❌ ai:test falló:', err?.message ?? err)
  process.exit(1)
})
