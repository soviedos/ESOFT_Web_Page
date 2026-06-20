import { Type } from '@google/genai'
import { generarJSON } from './gemini'

// ⚠️ SOLO SERVER-SIDE (usa la capa de IA).

// ── Tipos de la extracción ───────────────────────────────────────────

export type ModalidadExtraida = 'cuatrimestral' | 'path' | 'curso_360' | 'curso_continuo'

export interface CompetenciaExtraida {
  nombre: string
  descripcion?: string | null
  sfiaCodigo?: string | null
  sfiaNivel?: number | null
  microcredencial?: string | null
  // Secuencia (1-based) de la unidad a la que pertenece; null si es del programa.
  unidad?: number | null
}

export interface UnidadExtraida {
  codigo?: string | null
  nombre: string
  cuatrimestre?: number | null
  secuencia?: number | null
  horasLectivas?: number | null
  horasPracticas?: number | null
  horasEstudio?: number | null
  creditos?: number | null
  descripcion?: string | null
}

export interface PlanExtraido {
  unidades: UnidadExtraida[]
  competencias: CompetenciaExtraida[]
}

export interface ProgramaExtraido {
  titulo: string
  modalidad: ModalidadExtraida
  nivel?: string | null
  area?: string | null
  nivelCredencial?: string | null
  duracionCuatrimestres?: number | null
  totalMicrociclos?: number | null
  duracionHoras?: number | null
  descripcion: string
  objetivo?: string | null
  perfilEgresado?: string | null
  tecnologias: string[]
  prerequisito?: string | null
  plan: PlanExtraido
}

// ── Schema de respuesta (arreglo de programas) ───────────────────────

const competenciaSchema = {
  type: Type.OBJECT,
  properties: {
    nombre: { type: Type.STRING },
    descripcion: { type: Type.STRING, nullable: true },
    sfiaCodigo: { type: Type.STRING, nullable: true, description: 'Solo el código SFIA, p. ej. "DBDS".' },
    sfiaNivel: { type: Type.INTEGER, nullable: true, description: 'Nivel SFIA, p. ej. 3.' },
    microcredencial: { type: Type.STRING, nullable: true },
    unidad: { type: Type.INTEGER, nullable: true, description: 'Secuencia (1-based) de la unidad a la que pertenece; null si es del programa.' },
  },
  required: ['nombre'],
}

const unidadSchema = {
  type: Type.OBJECT,
  properties: {
    codigo: { type: Type.STRING, nullable: true },
    nombre: { type: Type.STRING },
    cuatrimestre: { type: Type.INTEGER, nullable: true },
    secuencia: { type: Type.INTEGER, nullable: true },
    horasLectivas: { type: Type.INTEGER, nullable: true },
    horasPracticas: { type: Type.INTEGER, nullable: true },
    horasEstudio: { type: Type.INTEGER, nullable: true },
    creditos: { type: Type.INTEGER, nullable: true },
    descripcion: { type: Type.STRING, nullable: true },
  },
  required: ['nombre'],
}

const programaSchema = {
  type: Type.OBJECT,
  properties: {
    titulo: { type: Type.STRING },
    modalidad: { type: Type.STRING, enum: ['cuatrimestral', 'path', 'curso_360', 'curso_continuo'] },
    nivel: { type: Type.STRING, nullable: true, description: 'Uno de: tecnico, bachillerato, maestria; o null.' },
    area: { type: Type.STRING, nullable: true, description: 'Nombre del área curricular, o null.' },
    nivelCredencial: { type: Type.STRING, nullable: true, description: 'Uno de: foundational, professional, advanced, expert; o null.' },
    duracionCuatrimestres: { type: Type.INTEGER, nullable: true },
    totalMicrociclos: { type: Type.INTEGER, nullable: true },
    duracionHoras: { type: Type.INTEGER, nullable: true },
    descripcion: { type: Type.STRING },
    objetivo: { type: Type.STRING, nullable: true },
    perfilEgresado: { type: Type.STRING, nullable: true },
    tecnologias: { type: Type.ARRAY, items: { type: Type.STRING } },
    prerequisito: { type: Type.STRING, nullable: true, description: 'Título del programa prerequisito, o null.' },
    plan: {
      type: Type.OBJECT,
      properties: {
        unidades: { type: Type.ARRAY, items: unidadSchema },
        competencias: { type: Type.ARRAY, items: competenciaSchema },
      },
      required: ['unidades', 'competencias'],
    },
  },
  required: ['titulo', 'modalidad', 'descripcion', 'tecnologias', 'plan'],
}

const RESPONSE_SCHEMA = {
  type: Type.ARRAY,
  items: programaSchema,
}

// ── Prompt ───────────────────────────────────────────────────────────

const INSTRUCCIONES = `Sos un extractor de datos académicos de ESOFT (Escuela de Ingeniería del Software, Universidad CENFOTEC). Recibís un documento Markdown con uno o más programas y devolvés un ARREGLO JSON con todos.

FORMATO DEL DOCUMENTO:
- Cada programa es un bloque que empieza con un encabezado "# Título". Los bloques se separan con una línea "---".
- La línea "Modalidad:" define la modalidad y qué campos aplican:
  • "Cuatrimestral" → modalidad 'cuatrimestral'. Tiene nivel (Técnico/Bachillerato/Maestría) y duración en cuatrimestres. El plan son CURSOS agrupados por cuatrimestre; cada curso tiene código, horas lectivas (HL), horas prácticas (HP), horas de estudio (HE) y créditos (cr). Asigná a cada curso su "cuatrimestre".
  • "Ruta de conocimiento" o "Path" → modalidad 'path'. Tiene área, nivel de credencial, total de microciclos y horas. El plan son MICROCICLOS (con su secuencia); cada microciclo puede tener competencias con código SFIA.
  • "Curso 360" → modalidad 'curso_360'. Área, credencial, horas. El plan son MÓDULOS (normalmente 3) con sus competencias.
  • "Curso continuo" → modalidad 'curso_continuo'. Área, credencial, horas. NO tiene unidades: las competencias van directo al programa (unidad = null).

REGLAS:
- Extraé TODOS los programas del documento como un arreglo.
- modalidad: mapeá al valor canónico (cuatrimestral | path | curso_360 | curso_continuo).
- nivel: tecnico | bachillerato | maestria (o null).
- nivelCredencial: foundational | professional | advanced | expert (o null).
- En "plan.unidades" van los cursos/microciclos/módulos. "plan.competencias" es un arreglo aparte; cada competencia indica en "unidad" la SECUENCIA (1-based) de la unidad a la que pertenece, o null si es del programa.
- SFIA: el formato "[SFIA: DBDS-3]" significa sfiaCodigo "DBDS" y sfiaNivel 3.
- NO inventes datos. Si un campo no aparece en el documento, devolvé null (o un arreglo vacío). No completes con suposiciones.`

// ── Extracción ───────────────────────────────────────────────────────

/**
 * Extrae todos los programas de un documento Markdown usando salida
 * estructurada de Gemini. No persiste nada ni valida contra la BD.
 */
export async function extraerProgramas(markdown: string): Promise<ProgramaExtraido[]> {
  const texto = (markdown ?? '').trim()
  if (!texto) return []

  const prompt = `${INSTRUCCIONES}\n\nDOCUMENTO:\n${texto}`

  const data = await generarJSON<unknown>(prompt, RESPONSE_SCHEMA)
  if (!Array.isArray(data)) {
    throw new Error('La extracción no devolvió un arreglo de programas.')
  }
  return data as ProgramaExtraido[]
}
