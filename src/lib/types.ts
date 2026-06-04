export interface CursoDato {
  code?: string
  nombre: string
  cuatrimestre: number
  orden: number
  creditos?: number | null
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
  tipo: string
  duracionCuatrimestres: number
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
