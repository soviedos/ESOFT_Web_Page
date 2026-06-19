import { slugify } from './utils'

// Campos específicos que aplican a cada modalidad (además de los comunes:
// título, descripción, objetivo, perfil de egreso, tecnologías, estado).
export interface CamposModalidad {
  nivel?: boolean
  duracionCuatrimestres?: boolean
  area?: boolean
  nivelCredencial?: boolean
  totalMicrociclos?: boolean
  duracionHoras?: boolean
  prerequisito?: boolean
}

export interface ModalidadConfig {
  value: string
  label: string
  descripcion: string
  formato: string
  campos: CamposModalidad
}

export const MODALIDAD_CONFIG: Record<string, ModalidadConfig> = {
  cuatrimestral: {
    value: 'cuatrimestral',
    label: 'Cuatrimestral',
    descripcion: 'Programa titulado por cuatrimestres (técnico, bachillerato o maestría). Plan de estudios con cursos, créditos y horas.',
    formato: 'Nivel · Duración en cuatrimestres · Cursos con créditos',
    campos: { nivel: true, duracionCuatrimestres: true },
  },
  path: {
    value: 'path',
    label: 'Ruta de conocimiento',
    descripcion: 'Itinerario fundacional por microciclos. Base común sobre la que se construyen las especializaciones.',
    formato: 'Área · Credencial · Microciclos · Horas · Prerequisito',
    campos: { area: true, nivelCredencial: true, totalMicrociclos: true, duracionHoras: true, prerequisito: true },
  },
  curso_360: {
    value: 'curso_360',
    label: 'Curso 360',
    descripcion: 'Especialización modular que cubre un dominio o tecnología de principio a fin.',
    formato: 'Área · Credencial · Horas · Prerequisito',
    campos: { area: true, nivelCredencial: true, duracionHoras: true, prerequisito: true },
  },
  curso_continuo: {
    value: 'curso_continuo',
    label: 'Curso continuo',
    descripcion: 'Formación corta y puntual sobre una competencia específica.',
    formato: 'Área · Credencial · Horas',
    campos: { area: true, nivelCredencial: true, duracionHoras: true },
  },
}

export const MODALIDADES = Object.values(MODALIDAD_CONFIG)

export function esModalidadValida(m: string | null | undefined): m is string {
  return !!m && m in MODALIDAD_CONFIG
}

// Valores de programa parseados de un FormData según la modalidad.
// Los campos que no aplican a la modalidad se fuerzan a null para
// mantener los datos limpios.
export interface ProgramaValores {
  titulo: string
  descripcion: string
  objetivo: string | null
  perfilEgresado: string | null
  tecnologias: string[]
  activo: boolean
  nivel: string | null
  duracionCuatrimestres: number | null
  areaCurricularId: string | null
  nivelCredencial: string | null
  totalMicrociclos: number | null
  duracionHoras: number | null
  prerequisitoId: string | null
}

export function parseProgramaForm(form: FormData, modalidad: string): ProgramaValores {
  const cfg = MODALIDAD_CONFIG[modalidad]
  const str = (k: string) => ((form.get(k) as string) ?? '').trim() || null
  const num = (k: string) => {
    const v = parseInt((form.get(k) as string) ?? '', 10)
    return Number.isNaN(v) ? null : v
  }

  return {
    titulo:         ((form.get('titulo') as string) ?? '').trim(),
    descripcion:    ((form.get('descripcion') as string) ?? '').trim(),
    objetivo:       str('objetivo'),
    perfilEgresado: str('perfil'),
    tecnologias:    ((form.get('tecnologias') as string) ?? '')
                      .split(',').map(t => t.trim()).filter(Boolean),
    activo:         form.get('activo') === 'true',
    nivel:                 cfg?.campos.nivel ? str('nivel') : null,
    duracionCuatrimestres: cfg?.campos.duracionCuatrimestres ? num('duracion') : null,
    areaCurricularId:      cfg?.campos.area ? str('area') : null,
    nivelCredencial:       cfg?.campos.nivelCredencial ? str('nivelCredencial') : null,
    totalMicrociclos:      cfg?.campos.totalMicrociclos ? num('totalMicrociclos') : null,
    duracionHoras:         cfg?.campos.duracionHoras ? num('duracionHoras') : null,
    prerequisitoId:        cfg?.campos.prerequisito ? str('prerequisito') : null,
  }
}

export { slugify }
