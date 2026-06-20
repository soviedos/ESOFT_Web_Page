import { Type } from '@google/genai'
import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { programas, areasCurriculares } from '../db/schema'
import { generarJSON } from './gemini'
import { MODALIDAD_CONFIG, esModalidadValida, slugify, type ProgramaValores } from './modalidades'
import {
  crearPrograma, guardarPlan,
  type PlanInput, type PlanCompetenciaInput, type PlanUnidadInput,
} from './programa-write'

// ⚠️ SOLO SERVER-SIDE (usa la capa de IA y la BD).

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

// ── Mapeo y persistencia ─────────────────────────────────────────────

export interface ResultadoImportacion {
  ok: boolean
  programaId?: string
  slug?: string
  titulo: string
  warnings: string[]
}

const NIVELES_VALIDOS = ['tecnico', 'bachillerato', 'maestria']
const CREDENCIALES_VALIDAS = ['foundational', 'professional', 'advanced', 'expert']

const limpiar = (s: unknown): string | null => {
  const t = typeof s === 'string' ? s.trim() : (s == null ? '' : String(s).trim())
  return t || null
}

// Genera un slug único en la BD (sufijo -2, -3… ante colisión).
async function slugUnico(base: string): Promise<string> {
  const raiz = base || 'programa'
  let slug = raiz
  let n = 1
  // Bucle acotado por seguridad.
  while (n < 1000) {
    const [existe] = await db.select({ id: programas.id })
      .from(programas).where(eq(programas.slug, slug)).limit(1)
    if (!existe) return slug
    n++
    slug = `${raiz}-${n}`
  }
  return `${raiz}-${Date.now()}`
}

// Resultado de resolver un programa extraído contra la BD, SIN persistir.
// Lo usa la previsualización del paso de revisión y también mapearYPersistir.
export interface ResolucionPrograma {
  ok: boolean
  titulo: string
  modalidad: string | null
  areaCurricularId: string | null
  prerequisitoId: string | null
  valores: ProgramaValores | null
  plan: PlanInput | null
  numUnidades: number
  numCompetencias: number
  warnings: string[]
}

/**
 * Resuelve un programa extraído al modelo de la BD (valida enums, resuelve área
 * y prerequisito, arma valores y plan) acumulando warnings. NO persiste nada.
 */
export async function resolverPrograma(extraido: ProgramaExtraido): Promise<ResolucionPrograma> {
  const warnings: string[] = []
  const titulo = limpiar(extraido?.titulo) ?? ''

  const vacio = (msg: string): ResolucionPrograma => ({
    ok: false, titulo: titulo || '(sin título)', modalidad: null,
    areaCurricularId: null, prerequisitoId: null, valores: null, plan: null,
    numUnidades: 0, numCompetencias: 0, warnings: [msg],
  })

  if (!titulo) return vacio('El programa no tiene título.')

  // 1) Modalidad.
  if (!esModalidadValida(extraido.modalidad)) {
    return vacio(`Modalidad inválida: "${extraido.modalidad}".`)
  }
  const modalidad = extraido.modalidad
  const cfg = MODALIDAD_CONFIG[modalidad]

  // 2) nivel / nivelCredencial canónicos.
  let nivel: string | null = null
  const nivelRaw = limpiar(extraido.nivel)
  if (nivelRaw) {
    const v = nivelRaw.toLowerCase()
    if (NIVELES_VALIDOS.includes(v)) nivel = v
    else warnings.push(`Nivel no canónico ignorado: "${nivelRaw}".`)
  }

  let nivelCredencial: string | null = null
  const credRaw = limpiar(extraido.nivelCredencial)
  if (credRaw) {
    const v = credRaw.toLowerCase()
    if (CREDENCIALES_VALIDAS.includes(v)) nivelCredencial = v
    else warnings.push(`Nivel de credencial no canónico ignorado: "${credRaw}".`)
  }

  // 3) Área (por slug o nombre, case-insensitive).
  let areaCurricularId: string | null = null
  const areaRaw = limpiar(extraido.area)
  if (areaRaw && cfg.campos.area) {
    const q = areaRaw.toLowerCase()
    const qSlug = slugify(areaRaw)
    const areas = await db.select({ id: areasCurriculares.id, slug: areasCurriculares.slug, nombre: areasCurriculares.nombre })
      .from(areasCurriculares)
    const match = areas.find(a =>
      a.slug.toLowerCase() === q ||
      a.nombre.trim().toLowerCase() === q ||
      a.slug.toLowerCase() === qSlug ||
      slugify(a.nombre) === qSlug,
    )
    if (match) areaCurricularId = match.id
    else warnings.push(`Área "${areaRaw}" no encontrada.`)
  } else if (areaRaw && !cfg.campos.area) {
    warnings.push(`La modalidad ${modalidad} no usa área; "${areaRaw}" ignorada.`)
  }

  // 4) Prerequisito (por título, case-insensitive).
  let prerequisitoId: string | null = null
  const prereqRaw = limpiar(extraido.prerequisito)
  if (prereqRaw && cfg.campos.prerequisito) {
    const q = prereqRaw.toLowerCase()
    const candidatos = await db.select({ id: programas.id, titulo: programas.titulo }).from(programas)
    const match = candidatos.find(p => p.titulo.trim().toLowerCase() === q)
    if (match) prerequisitoId = match.id
    else warnings.push(`Prerequisito "${prereqRaw}" no encontrado.`)
  }

  // 5) Valores del programa (campos no aplicables a la modalidad → null). BORRADOR.
  const valores: ProgramaValores = {
    titulo,
    descripcion:           limpiar(extraido.descripcion) ?? '',
    objetivo:              limpiar(extraido.objetivo),
    perfilEgresado:        limpiar(extraido.perfilEgresado),
    tecnologias:           Array.isArray(extraido.tecnologias) ? extraido.tecnologias.map(t => String(t).trim()).filter(Boolean) : [],
    activo:                false,
    nivel:                 cfg.campos.nivel ? nivel : null,
    duracionCuatrimestres: cfg.campos.duracionCuatrimestres ? (extraido.duracionCuatrimestres ?? null) : null,
    areaCurricularId:      cfg.campos.area ? areaCurricularId : null,
    nivelCredencial:       cfg.campos.nivelCredencial ? nivelCredencial : null,
    totalMicrociclos:      cfg.campos.totalMicrociclos ? (extraido.totalMicrociclos ?? null) : null,
    duracionHoras:         cfg.campos.duracionHoras ? (extraido.duracionHoras ?? null) : null,
    prerequisitoId:        cfg.campos.prerequisito ? prerequisitoId : null,
  }

  // 6) Armar el plan: nestear competencias en su unidad por secuencia 1-based.
  const tieneUnidades = cfg.plan.tipoUnidad !== null
  const unidadesExtraidas = extraido.plan?.unidades ?? []
  const competenciasExtraidas = extraido.plan?.competencias ?? []

  const aCompetencia = (c: CompetenciaExtraida): PlanCompetenciaInput => ({
    nombre:          limpiar(c.nombre) ?? '',
    descripcion:     limpiar(c.descripcion),
    sfiaCodigo:      limpiar(c.sfiaCodigo),
    sfiaNivel:       c.sfiaNivel ?? null,
    microcredencial: limpiar(c.microcredencial),
  })

  const compPorUnidad = new Map<number, PlanCompetenciaInput[]>()
  const compPrograma: PlanCompetenciaInput[] = []
  for (const c of competenciasExtraidas) {
    const dato = aCompetencia(c)
    if (!dato.nombre) continue
    const idx = c.unidad
    if (tieneUnidades && idx != null && idx >= 1 && idx <= unidadesExtraidas.length) {
      if (!compPorUnidad.has(idx)) compPorUnidad.set(idx, [])
      compPorUnidad.get(idx)!.push(dato)
    } else {
      if (tieneUnidades && idx != null) {
        warnings.push(`Competencia "${dato.nombre}" referencia la unidad ${idx} (inexistente); se asignó al programa.`)
      }
      compPrograma.push(dato)
    }
  }

  const unidades: PlanUnidadInput[] = tieneUnidades
    ? unidadesExtraidas
        .map((u, i): PlanUnidadInput => ({
          codigo:         limpiar(u.codigo),
          nombre:         limpiar(u.nombre) ?? '',
          secuencia:      u.secuencia ?? null,
          cuatrimestre:   u.cuatrimestre ?? null,
          descripcion:    limpiar(u.descripcion),
          horasLectivas:  u.horasLectivas ?? null,
          horasPracticas: u.horasPracticas ?? null,
          horasEstudio:   u.horasEstudio ?? null,
          creditos:       u.creditos ?? null,
          competencias:   compPorUnidad.get(i + 1) ?? [],
        }))
        .filter(u => u.nombre)
    : []

  const plan: PlanInput = { unidades, competencias: compPrograma }

  return {
    ok: true, titulo, modalidad,
    areaCurricularId, prerequisitoId, valores, plan,
    numUnidades: unidades.length,
    numCompetencias: compPrograma.length + unidades.reduce((s, u) => s + u.competencias.length, 0),
    warnings,
  }
}

/**
 * Resuelve y persiste un programa extraído como BORRADOR (activo=false) junto
 * con su plan. guardarPlan dispara la vectorización best-effort.
 */
export async function mapearYPersistir(extraido: ProgramaExtraido): Promise<ResultadoImportacion> {
  const r = await resolverPrograma(extraido)
  if (!r.ok || !r.valores || !r.plan || !r.modalidad) {
    return { ok: false, titulo: r.titulo, warnings: r.warnings }
  }
  try {
    const slug = await slugUnico(slugify(r.titulo))
    const nuevo = await crearPrograma(r.modalidad, r.valores, slug)
    await guardarPlan(nuevo.id, r.modalidad, r.plan)
    return { ok: true, programaId: nuevo.id, slug: nuevo.slug, titulo: r.titulo, warnings: r.warnings }
  } catch (err: any) {
    return { ok: false, titulo: r.titulo, warnings: [...r.warnings, `Error al persistir: ${err?.message ?? err}`] }
  }
}
