import type { InferSelectModel } from 'drizzle-orm'
import type {
  programas,
  cursos,
  competencias,
  rutas,
  areasCurriculares,
} from '../db/schema'

// ── Tipos de fila inferidos del schema (evita duplicar a mano) ──────
export type Programa       = InferSelectModel<typeof programas>
export type Curso          = InferSelectModel<typeof cursos>
export type Competencia    = InferSelectModel<typeof competencias>
export type Ruta           = InferSelectModel<typeof rutas>
export type AreaCurricular = InferSelectModel<typeof areasCurriculares>

// ── View-models consumidos por los layouts de programa ──────────────
export interface EstadisticaDato {
  valor: string
  label: string
  colorValor?: 'content' | 'brand' | 'accent2'
  size?: 'lg' | 'xl'
}

export interface CompetenciaDato {
  nombre: string
  descripcion?: string | null
  microcredencial?: string | null
  sfiaCodigo?: string | null
  sfiaNivel?: number | null
}

// Curso de un programa cuatrimestral (con horas y créditos).
export interface CursoDato {
  codigo?: string | null
  nombre: string
  cuatrimestre: number
  orden: number
  creditos?: number | null
  horasLectivas?: number | null
  horasPracticas?: number | null
  horasEstudio?: number | null
}

// Unidad modular: microciclo (path) o módulo 360, con sus competencias.
export interface UnidadDato {
  codigo?: string | null
  nombre: string
  secuencia: number
  orden: number
  descripcion?: string | null
  competencias: CompetenciaDato[]
}

// Referencia ligera a otro programa (área / prerequisito).
export interface ReferenciaPrograma {
  titulo: string
  slug: string
}

// Modelo unificado que [slug].astro arma y pasa al layout por modalidad.
export interface ProgramaDetalle {
  titulo: string
  descripcion: string
  modalidad: string
  nivel?: string | null
  nivelCredencial?: string | null
  duracionCuatrimestres?: number | null
  totalMicrociclos?: number | null
  duracionHoras?: number | null
  microcredencial?: string | null
  objetivo?: string | null
  perfilEgresado?: string | null
  tecnologias?: string[]
  area?: { nombre: string; slug: string } | null
  prerequisito?: ReferenciaPrograma | null
  // Plan: cuatrimestral usa `cursos`; path/360 usan `unidades`;
  // continuo usa `competenciasGenerales`.
  cursos: CursoDato[]
  unidades: UnidadDato[]
  competenciasGenerales: CompetenciaDato[]
}
