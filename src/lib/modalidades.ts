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

// Configuración del plan de estudios (unidades) por modalidad.
export type TipoUnidad = 'curso' | 'microciclo' | 'modulo_360'

export interface CamposUnidad {
  codigo?: boolean
  cuatrimestre?: boolean
  horas?: boolean       // HL / HP / HE
  creditos?: boolean
  secuencia?: boolean
  descripcion?: boolean
}

export interface PlanConfig {
  // tipoUnidad null → la modalidad no tiene unidades; competencias a nivel de programa.
  tipoUnidad: TipoUnidad | null
  unidadLabel: string
  unidadLabelPlural: string
  campos: CamposUnidad
  ayuda: string
}

export interface ModalidadConfig {
  value: string
  label: string
  descripcion: string
  formato: string
  campos: CamposModalidad
  plan: PlanConfig
}

export const MODALIDAD_CONFIG: Record<string, ModalidadConfig> = {
  cuatrimestral: {
    value: 'cuatrimestral',
    label: 'Cuatrimestral',
    descripcion: 'Programa titulado por cuatrimestres (técnico, bachillerato o maestría). Plan de estudios con cursos, créditos y horas.',
    formato: 'Nivel · Duración en cuatrimestres · Cursos con créditos',
    campos: { nivel: true, duracionCuatrimestres: true },
    plan: {
      tipoUnidad: 'curso',
      unidadLabel: 'Curso',
      unidadLabelPlural: 'Cursos',
      campos: { codigo: true, cuatrimestre: true, horas: true, creditos: true },
      ayuda: 'Cargá los cursos del plan. Asigná el cuatrimestre a cada uno; se agrupan por cuatrimestre en la ficha pública.',
    },
  },
  path: {
    value: 'path',
    label: 'Ruta de conocimiento',
    descripcion: 'Itinerario fundacional por microciclos. Base común sobre la que se construyen las especializaciones.',
    formato: 'Área · Credencial · Microciclos · Horas · Prerequisito',
    campos: { area: true, nivelCredencial: true, totalMicrociclos: true, duracionHoras: true, prerequisito: true },
    plan: {
      tipoUnidad: 'microciclo',
      unidadLabel: 'Microciclo',
      unidadLabelPlural: 'Microciclos',
      campos: { secuencia: true, descripcion: true },
      ayuda: 'Cargá los microciclos en orden. Cada uno puede tener sus competencias con código SFIA.',
    },
  },
  curso_360: {
    value: 'curso_360',
    label: 'Curso 360',
    descripcion: 'Especialización modular que cubre un dominio o tecnología de principio a fin.',
    formato: 'Área · Credencial · Horas · Prerequisito',
    campos: { area: true, nivelCredencial: true, duracionHoras: true, prerequisito: true },
    plan: {
      tipoUnidad: 'modulo_360',
      unidadLabel: 'Módulo',
      unidadLabelPlural: 'Módulos',
      campos: { secuencia: true, descripcion: true },
      ayuda: 'Un curso 360 suele tener 3 módulos. Cada uno puede tener sus competencias.',
    },
  },
  curso_continuo: {
    value: 'curso_continuo',
    label: 'Curso continuo',
    descripcion: 'Formación corta y puntual sobre una competencia específica.',
    formato: 'Área · Credencial · Horas',
    campos: { area: true, nivelCredencial: true, duracionHoras: true },
    plan: {
      tipoUnidad: null,
      unidadLabel: 'Competencia',
      unidadLabelPlural: 'Competencias',
      campos: {},
      ayuda: 'Un curso continuo no tiene unidades: cargá directamente las competencias que desarrolla.',
    },
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
