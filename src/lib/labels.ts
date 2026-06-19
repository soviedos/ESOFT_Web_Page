// Etiquetas legibles para los enums del modelo académico.

export const modalidadLabel: Record<string, string> = {
  cuatrimestral:  'Programa cuatrimestral',
  path:           'Ruta de conocimiento',
  curso_360:      'Curso 360',
  curso_continuo: 'Curso de aprendizaje continuo',
}

export const nivelLabel: Record<string, string> = {
  tecnico:      'Técnico',
  bachillerato: 'Bachillerato',
  maestria:     'Maestría',
}

export const nivelCredencialLabel: Record<string, string> = {
  foundational: 'Fundacional',
  professional: 'Profesional',
  advanced:     'Avanzado',
  expert:       'Experto',
}

// Etiqueta para la unidad de un plan modular según la modalidad.
export const unidadLabel: Record<string, string> = {
  path:      'Microciclo',
  curso_360: 'Módulo',
}
