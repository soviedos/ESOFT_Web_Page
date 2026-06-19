import { db } from '../db/client'
import { programas, cursos, competencias } from '../db/schema'
import { eq } from 'drizzle-orm'
import { slugify } from './utils'
import { MODALIDAD_CONFIG, type ProgramaValores } from './modalidades'

// ── Escritura de metadata del programa (único camino) ────────────────

function valoresAColumnas(modalidad: string, v: ProgramaValores) {
  return {
    titulo:                v.titulo,
    descripcion:           v.descripcion,
    nivel:                 v.nivel as any,
    objetivo:              v.objetivo,
    perfilEgresado:        v.perfilEgresado,
    tecnologias:           v.tecnologias,
    activo:                v.activo,
    duracionCuatrimestres: v.duracionCuatrimestres,
    areaCurricularId:      v.areaCurricularId,
    nivelCredencial:       v.nivelCredencial as any,
    totalMicrociclos:      v.totalMicrociclos,
    duracionHoras:         v.duracionHoras,
    prerequisitoId:        v.prerequisitoId,
  }
}

export async function crearPrograma(modalidad: string, v: ProgramaValores) {
  const [nuevo] = await db.insert(programas).values({
    slug: slugify(v.titulo),
    modalidad: modalidad as any,
    ...valoresAColumnas(modalidad, v),
  }).returning()
  return nuevo
}

export async function actualizarPrograma(id: string, modalidad: string, v: ProgramaValores) {
  await db.update(programas)
    .set({ ...valoresAColumnas(modalidad, v), updatedAt: new Date() })
    .where(eq(programas.id, id))
}

// ── Plan de estudios (unidades + competencias) ───────────────────────

export interface PlanCompetenciaInput {
  nombre: string
  descripcion: string | null
  sfiaCodigo: string | null
  sfiaNivel: number | null
  microcredencial: string | null
}

export interface PlanUnidadInput {
  codigo: string | null
  nombre: string
  secuencia: number | null
  cuatrimestre: number | null
  descripcion: string | null
  horasLectivas: number | null
  horasPracticas: number | null
  horasEstudio: number | null
  creditos: number | null
  competencias: PlanCompetenciaInput[]
}

export interface PlanInput {
  unidades: PlanUnidadInput[]
  // Competencias a nivel de programa (modalidades sin unidades, p. ej. continuo).
  competencias: PlanCompetenciaInput[]
}

// Normaliza el JSON que envía el editor; descarta filas sin nombre.
export function parsePlan(raw: string | null | undefined): PlanInput {
  const vacio: PlanInput = { unidades: [], competencias: [] }
  if (!raw) return vacio

  let data: any
  try { data = JSON.parse(raw) } catch { return vacio }

  const str = (x: any): string | null => {
    const s = typeof x === 'string' ? x.trim() : (x == null ? '' : String(x).trim())
    return s || null
  }
  const num = (x: any): number | null => {
    if (x === '' || x == null) return null
    const n = Number(x)
    return Number.isFinite(n) ? Math.trunc(n) : null
  }
  const comp = (c: any): PlanCompetenciaInput | null => {
    const nombre = str(c?.nombre)
    if (!nombre) return null
    return {
      nombre,
      descripcion:     str(c?.descripcion),
      sfiaCodigo:      str(c?.sfiaCodigo),
      sfiaNivel:       num(c?.sfiaNivel),
      microcredencial: str(c?.microcredencial),
    }
  }
  const comps = (arr: any): PlanCompetenciaInput[] =>
    (Array.isArray(arr) ? arr : []).map(comp).filter((x): x is PlanCompetenciaInput => x !== null)

  const unidades: PlanUnidadInput[] = (Array.isArray(data?.unidades) ? data.unidades : [])
    .map((u: any): PlanUnidadInput | null => {
      const nombre = str(u?.nombre)
      if (!nombre) return null
      return {
        codigo:         str(u?.codigo),
        nombre,
        secuencia:      num(u?.secuencia),
        cuatrimestre:   num(u?.cuatrimestre),
        descripcion:    str(u?.descripcion),
        horasLectivas:  num(u?.horasLectivas),
        horasPracticas: num(u?.horasPracticas),
        horasEstudio:   num(u?.horasEstudio),
        creditos:       num(u?.creditos),
        competencias:   comps(u?.competencias),
      }
    })
    .filter((x: PlanUnidadInput | null): x is PlanUnidadInput => x !== null)

  return { unidades, competencias: comps(data?.competencias) }
}

// Persistencia atómica: borra y reinserta cursos y competencias del programa.
export async function guardarPlan(programaId: string, modalidad: string, plan: PlanInput) {
  const tipo = MODALIDAD_CONFIG[modalidad]?.plan.tipoUnidad ?? null

  await db.transaction(async (tx) => {
    // Limpiar el plan actual (competencias primero por la FK a cursos).
    await tx.delete(competencias).where(eq(competencias.programaId, programaId))
    await tx.delete(cursos).where(eq(cursos.programaId, programaId))

    if (tipo) {
      for (const [i, u] of plan.unidades.entries()) {
        const secuencia = u.cuatrimestre ?? u.secuencia ?? i + 1
        const [curso] = await tx.insert(cursos).values({
          programaId,
          tipo,
          codigo:         u.codigo,
          nombre:         u.nombre,
          secuencia,
          cuatrimestre:   u.cuatrimestre,
          orden:          i + 1,
          descripcion:    u.descripcion,
          horasLectivas:  u.horasLectivas,
          horasPracticas: u.horasPracticas,
          horasEstudio:   u.horasEstudio,
          creditos:       u.creditos,
        }).returning()

        for (const [j, c] of u.competencias.entries()) {
          await tx.insert(competencias).values({
            programaId,
            cursoId:         curso.id,
            nombre:          c.nombre,
            descripcion:     c.descripcion,
            sfiaCodigo:      c.sfiaCodigo,
            sfiaNivel:       c.sfiaNivel,
            microcredencial: c.microcredencial,
            orden:           j + 1,
          })
        }
      }
    }

    // Competencias a nivel de programa (sin unidad).
    for (const [j, c] of plan.competencias.entries()) {
      await tx.insert(competencias).values({
        programaId,
        cursoId:         null,
        nombre:          c.nombre,
        descripcion:     c.descripcion,
        sfiaCodigo:      c.sfiaCodigo,
        sfiaNivel:       c.sfiaNivel,
        microcredencial: c.microcredencial,
        orden:           j + 1,
      })
    }
  })
}
