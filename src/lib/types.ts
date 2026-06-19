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

// ── View-models consumidos por los componentes de programa ──────────
export interface CursoDato {
  codigo?: string | null
  nombre: string
  cuatrimestre: number
  secuencia?: number
  orden: number
  creditos?: number | null
  horasLectivas?: number | null
  horasPracticas?: number | null
  horasEstudio?: number | null
}

export interface EstadisticaDato {
  valor: string
  label: string
  colorValor?: 'content' | 'brand' | 'accent2'
  size?: 'lg' | 'xl'
}

export interface ProgramaData {
  titulo: string
  descripcion: string
  modalidad: string
  nivel?: string | null
  duracionCuatrimestres?: number | null
  totalMicrociclos?: number | null
  duracionHoras?: number | null
  estadisticas?: EstadisticaDato[]
  tecnologias?: string[]
  objetivo?: string | null
  cursos?: CursoDato[]
  // overrides opcionales
  badgeOverride?: string
  tituloAcento?: string
  ctaTitulo?: string
  ctaTituloAcento?: string
  ctaDescripcion?: string
}
