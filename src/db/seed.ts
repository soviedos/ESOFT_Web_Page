/**
 * Seed completo de la BD ESOFT.
 * Ejecutar: npm run db:seed
 * Requiere DATABASE_URL en .env (o como variable de entorno).
 *
 * ADVERTENCIA: borra y reinserta todos los programas, cursos y rutas.
 * No toca las tablas users, docentes, noticias, solicitudes.
 */

import { db, pool } from './client.js'
import { programas, cursos as cursosTable, rutas as rutasTable } from './schema.js'

// ── Tipos internos ──────────────────────────────────────────────────

type Curso = {
  code?: string
  nombre: string
  cuatrimestre: number
  orden: number
  creditos?: number
}

type ProgramaDef = {
  slug: string
  titulo: string
  tipo: 'bachillerato' | 'maestria' | 'tecnico' | 'ruta_corporativa'
  nivel: 'tecnico' | 'bachillerato' | 'maestria'
  descripcion: string
  duracionCuatrimestres: number
  tecnologias: string[]
  objetivo?: string
  perfilEgresado?: string
  cursos: Curso[]
}

type RutaDef = {
  slug: string
  titulo: string
  descripcion: string
  programaSlugs: string[]
}

// ── Programas ───────────────────────────────────────────────────────

const PROGRAMAS: ProgramaDef[] = [

  // ── Bachillerato ──────────────────────────────────────────────────
  {
    slug: 'bachillerato-ingenieria-software',
    titulo: 'Bachillerato en Ingeniería del Software',
    tipo: 'bachillerato', nivel: 'bachillerato',
    descripcion: 'El Bachillerato en Ingeniería del Software de la Universidad CENFOTEC forma ingenieros capaces de diseñar, validar y liderar soluciones de software en un entorno donde la inteligencia artificial es parte del proceso de desarrollo.',
    duracionCuatrimestres: 9,
    tecnologias: ['Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Git', 'AWS'],
    objetivo: 'Formar profesionales capaces de diseñar, desarrollar, validar y liderar soluciones de software con criterio ingenieril y dominio de herramientas de inteligencia artificial.',
    perfilEgresado: 'Ingenieros de software que pueden diseñar, desarrollar y liderar soluciones tecnológicas, trabajar en equipos ágiles y adaptarse a entornos donde la IA acelera el desarrollo.',
    cursos: [
      // Q1
      { code: 'SOFT-09',  nombre: 'Introducción a la Ingeniería del Software',    cuatrimestre: 1, orden: 1, creditos: 3 },
      { code: 'FUN-02',   nombre: 'Lógica y Matemática Básica',                   cuatrimestre: 1, orden: 2, creditos: 3 },
      { code: 'SOFT-01',  nombre: 'Principios de Programación I',                 cuatrimestre: 1, orden: 3, creditos: 5 },
      { code: 'FUN-01',   nombre: 'Introducción a las Tecnologías de Información',cuatrimestre: 1, orden: 4, creditos: 3 },
      { code: 'FUN-08',   nombre: 'Expresión Oral y Escrita',                     cuatrimestre: 1, orden: 5, creditos: 3 },
      // Q2
      { code: 'FUN-05',    nombre: 'Cálculo Diferencial e Integral',              cuatrimestre: 2, orden: 1, creditos: 3 },
      { code: 'FUN-03',    nombre: 'Matemática Discreta 1',                       cuatrimestre: 2, orden: 2, creditos: 3 },
      { code: 'SOFT-02',   nombre: 'Principios de Programación 2',                cuatrimestre: 2, orden: 3, creditos: 5 },
      { code: 'SOFT-06C2', nombre: 'Diseño y Programación Web',                   cuatrimestre: 2, orden: 4, creditos: 4 },
      { code: 'FUN-09',    nombre: 'Desarrollo de Habilidades Blandas',           cuatrimestre: 2, orden: 5, creditos: 3 },
      // Q3
      { code: 'FUN-18',    nombre: 'Física 1',                                    cuatrimestre: 3, orden: 1, creditos: 3 },
      { code: 'FUN-17',    nombre: 'Matemática Discreta 2',                       cuatrimestre: 3, orden: 2, creditos: 3 },
      { code: 'SOFT-11C1', nombre: 'Proyecto Integrador 1',                       cuatrimestre: 3, orden: 3, creditos: 5 },
      { code: 'SOFT-10',   nombre: 'Estructuras de Datos',                        cuatrimestre: 3, orden: 4, creditos: 3 },
      { code: 'FUN-14',    nombre: 'Inglés Conversacional 1',                     cuatrimestre: 3, orden: 5, creditos: 2 },
      // Q4
      { code: 'FUN-19',   nombre: 'Física 2',                                     cuatrimestre: 4, orden: 1, creditos: 3 },
      { code: 'FUN-06',   nombre: 'Álgebra Lineal',                               cuatrimestre: 4, orden: 2, creditos: 3 },
      { code: 'SOFT-04',  nombre: 'Programación Orientada a Objetos',             cuatrimestre: 4, orden: 3, creditos: 5 },
      { code: 'SOFT-03',  nombre: 'Fundamentos de Bases de Datos',                cuatrimestre: 4, orden: 4, creditos: 4 },
      { code: 'FUN-10',   nombre: 'Pensamiento Crítico',                          cuatrimestre: 4, orden: 5, creditos: 3 },
      // Q5
      { code: 'SOFT-13C1', nombre: 'Arquitectura de Software 1',                  cuatrimestre: 5, orden: 1, creditos: 3 },
      { code: 'FUN-04',    nombre: 'Probabilidad y Estadística 1',                cuatrimestre: 5, orden: 2, creditos: 3 },
      { code: 'SOFT-12C1', nombre: 'Programación Web Avanzada',                   cuatrimestre: 5, orden: 3, creditos: 4 },
      { code: 'SOFT-14',   nombre: 'Procesos de Ingeniería del Software',         cuatrimestre: 5, orden: 4, creditos: 3 },
      { code: 'FUN-15',    nombre: 'Inglés Conversacional 2',                     cuatrimestre: 5, orden: 5, creditos: 2 },
      // Q6
      { code: 'FUN-20',    nombre: 'Física 3',                                    cuatrimestre: 6, orden: 1, creditos: 3 },
      { code: 'FUN-07',    nombre: 'Probabilidad y Estadística 2',                cuatrimestre: 6, orden: 2, creditos: 3 },
      { code: 'SOFT-18C1', nombre: 'Proyecto Integrador 2',                       cuatrimestre: 6, orden: 3, creditos: 5 },
      { code: 'SOFT-17',   nombre: 'Calidad, Verificación y Validación del Software', cuatrimestre: 6, orden: 4, creditos: 3 },
      { code: 'FUN-11',    nombre: 'Liderazgo y Trabajo Colaborativo',            cuatrimestre: 6, orden: 5, creditos: 3 },
      // Q7
      { code: 'SINT-04',  nombre: 'Principios de Inteligencia Artificial',        cuatrimestre: 7, orden: 1, creditos: 3 },
      { code: 'SOFT-15',  nombre: 'Diseño de Interacción Humano-Computador',      cuatrimestre: 7, orden: 2, creditos: 3 },
      { code: 'SOFT-16',  nombre: 'Arquitectura de Software 2',                   cuatrimestre: 7, orden: 3, creditos: 3 },
      { code: 'TI-03',    nombre: 'Arquitectura de Computadoras',                 cuatrimestre: 7, orden: 4, creditos: 3 },
      { code: 'FUN-16',   nombre: 'Inglés Conversacional 3',                      cuatrimestre: 7, orden: 5, creditos: 2 },
      // Q8
      { code: 'Electiva 1', nombre: 'Curso Electivo 1 (ver opciones)',            cuatrimestre: 8, orden: 1, creditos: 3 },
      { code: 'SOFT-22',   nombre: 'Programación Móvil',                          cuatrimestre: 8, orden: 2, creditos: 3 },
      { code: 'TI-01',     nombre: 'Fundamentos de Redes',                        cuatrimestre: 8, orden: 3, creditos: 3 },
      { code: 'FUN-12',    nombre: 'Ética y Sostenibilidad en Tecnología',        cuatrimestre: 8, orden: 4, creditos: 3 },
      // Q9
      { code: 'Electiva 2', nombre: 'Curso Electivo 2 (ver opciones)',            cuatrimestre: 9, orden: 1, creditos: 3 },
      { code: 'SOFT-23',   nombre: 'Proyecto Integrador 3',                       cuatrimestre: 9, orden: 2, creditos: 5 },
      { code: 'CIB-06',    nombre: 'Desarrollo Seguro del Software',              cuatrimestre: 9, orden: 3, creditos: 3 },
      { code: 'FUN-13',    nombre: 'Investigación y Emprendimiento',              cuatrimestre: 9, orden: 4, creditos: 3 },
    ],
  },

  // ── Maestrías ─────────────────────────────────────────────────────
  {
    slug: 'maestria-ingenieria-software-ia',
    titulo: 'Maestría en Ingeniería del Software — MISIA',
    tipo: 'maestria', nivel: 'maestria',
    descripcion: 'Dominá todos los aspectos de producción de software con aplicación de principios ingenieriles e inteligencia artificial. Conceptualizá, diseñá y liderá sistemas de software que incorporen componentes de IA con criterio técnico, ético y estratégico.',
    duracionCuatrimestres: 6,
    tecnologias: ['Python', 'TensorFlow', 'PyTorch', 'scikit-learn', 'MLflow', 'Docker', 'UML', 'Java'],
    objetivo: 'Formar ingenieros de software de alto nivel capaces de liderar proyectos de software que incorporen inteligencia artificial con criterio técnico, ético y estratégico.',
    cursos: [
      { code: 'PSWE-01', nombre: 'Tendencias en Ingeniería del Software',       cuatrimestre: 1, orden: 1, creditos: 4 },
      { code: 'PSWE-02', nombre: 'Requerimientos de Software y Sistemas',        cuatrimestre: 1, orden: 2, creditos: 5 },
      { code: 'PSWE-03', nombre: 'Construcción y Mantenimiento de Software',     cuatrimestre: 2, orden: 1, creditos: 5 },
      { code: 'PSWE-04', nombre: 'Diseño de Sistemas de Software',               cuatrimestre: 2, orden: 2, creditos: 5 },
      { code: 'PSWE-05', nombre: 'Taller de Innovación en Software 1',           cuatrimestre: 2, orden: 3, creditos: 3 },
      { code: 'PSWE-06', nombre: 'Calidad y Pruebas de Software',                cuatrimestre: 3, orden: 1, creditos: 4 },
      { code: 'PSWE-07', nombre: 'Procesos y Administración de Software',        cuatrimestre: 3, orden: 2, creditos: 4 },
      { code: 'PSWE-08', nombre: 'Taller de Innovación en Software 2',           cuatrimestre: 3, orden: 3, creditos: 3 },
      { code: 'PSWE-18', nombre: 'Aplicaciones de la Inteligencia Artificial',   cuatrimestre: 4, orden: 1, creditos: 4 },
      { code: 'PSWE-09', nombre: 'Metodología de Investigación en Informática',  cuatrimestre: 4, orden: 2, creditos: 4 },
      { code: 'Electivo', nombre: 'Electivo del Énfasis en IA',                  cuatrimestre: 4, orden: 3, creditos: 4 },
      { code: 'PSWE-10', nombre: 'Proyecto de Investigación Aplicada 1',         cuatrimestre: 5, orden: 1, creditos: 5 },
      { code: 'Electivo', nombre: 'Electivo del Énfasis en IA',                  cuatrimestre: 5, orden: 2, creditos: 4 },
      { code: 'PSWE-11', nombre: 'Proyecto de Investigación Aplicada 2',         cuatrimestre: 6, orden: 1, creditos: 6 },
      { code: 'Electivo', nombre: 'Electivo del Énfasis en IA',                  cuatrimestre: 6, orden: 2, creditos: 4 },
    ],
  },
  {
    slug: 'maestria-arquitectura-diseno-software',
    titulo: 'Maestría en Ingeniería del Software — MISAD',
    tipo: 'maestria', nivel: 'maestria',
    descripcion: 'Diseñá y especificá sistemas de gran tamaño o complejidad. Seleccioná estándares, métodos y herramientas apropiados para equilibrar requerimientos funcionales, de calidad, seguridad y gestión en sistemas intensivos en software.',
    duracionCuatrimestres: 6,
    tecnologias: ['UML', 'Microservicios', 'Docker', 'Kubernetes', 'AWS', 'Kafka', 'GraphQL', 'Terraform'],
    objetivo: 'Formar especialistas en arquitectura de software capaces de diseñar y liderar sistemas de gran escala con dominio de patrones arquitectónicos y decisiones técnicas estratégicas.',
    cursos: [
      { code: 'PSWE-01', nombre: 'Tendencias en Ingeniería del Software',       cuatrimestre: 1, orden: 1, creditos: 4 },
      { code: 'PSWE-02', nombre: 'Requerimientos de Software y Sistemas',        cuatrimestre: 1, orden: 2, creditos: 5 },
      { code: 'PSWE-03', nombre: 'Construcción y Mantenimiento de Software',     cuatrimestre: 2, orden: 1, creditos: 5 },
      { code: 'PSWE-04', nombre: 'Diseño de Sistemas de Software',               cuatrimestre: 2, orden: 2, creditos: 5 },
      { code: 'PSWE-05', nombre: 'Taller de Innovación en Software 1',           cuatrimestre: 2, orden: 3, creditos: 3 },
      { code: 'PSWE-06', nombre: 'Calidad y Pruebas de Software',                cuatrimestre: 3, orden: 1, creditos: 4 },
      { code: 'PSWE-07', nombre: 'Procesos y Administración de Software',        cuatrimestre: 3, orden: 2, creditos: 4 },
      { code: 'PSWE-08', nombre: 'Taller de Innovación en Software 2',           cuatrimestre: 3, orden: 3, creditos: 3 },
      { code: 'PSWE-12', nombre: 'Arquitectura de Sistemas de Software',         cuatrimestre: 4, orden: 1, creditos: 4 },
      { code: 'PSWE-09', nombre: 'Metodología de Investigación en Informática',  cuatrimestre: 4, orden: 2, creditos: 4 },
      { code: 'Electivo', nombre: 'Electivo del Énfasis en Arquitectura',        cuatrimestre: 4, orden: 3, creditos: 4 },
      { code: 'PSWE-10', nombre: 'Proyecto de Investigación Aplicada 1',         cuatrimestre: 5, orden: 1, creditos: 5 },
      { code: 'Electivo', nombre: 'Electivo del Énfasis en Arquitectura',        cuatrimestre: 5, orden: 2, creditos: 4 },
      { code: 'PSWE-11', nombre: 'Proyecto de Investigación Aplicada 2',         cuatrimestre: 6, orden: 1, creditos: 6 },
      { code: 'Electivo', nombre: 'Electivo del Énfasis en Arquitectura',        cuatrimestre: 6, orden: 2, creditos: 4 },
    ],
  },

  // ── Técnicos N5 ───────────────────────────────────────────────────
  {
    slug: 'tecnico-ingenieria-software',
    titulo: 'Técnico en Ingeniería del Software',
    tipo: 'tecnico', nivel: 'tecnico',
    descripcion: 'La Ingeniería del Software es una de las diez carreras de mayor demanda en Costa Rica. Con este técnico desarrollarás competencias digitales, socioemocionales y conocimiento técnico para analizar problemas y diseñar soluciones creativas que los resuelvan.',
    duracionCuatrimestres: 7,
    tecnologias: ['JavaScript', 'Java', 'Python', 'SQL', 'HTML/CSS', 'Git'],
    objetivo: 'Formar técnicos en desarrollo de software capaces de construir aplicaciones, trabajar en equipos ágiles y adaptarse a los cambios de la industria tecnológica.',
    cursos: [
      { nombre: 'Introducción a las Tecnologías de Información',  cuatrimestre: 1, orden: 1, creditos: 3 },
      { nombre: 'Expresión Oral y Escrita',                       cuatrimestre: 1, orden: 2, creditos: 3 },
      { nombre: 'Introducción a la Ing. del Software',            cuatrimestre: 1, orden: 3, creditos: 3 },
      { nombre: 'Desarrollo de Habilidades Blandas',              cuatrimestre: 2, orden: 1, creditos: 3 },
      { nombre: 'Principios de Programación 1',                   cuatrimestre: 2, orden: 2, creditos: 5 },
      { nombre: 'Inglés Conversacional 1',                        cuatrimestre: 3, orden: 1, creditos: 2 },
      { nombre: 'Principios de Programación 2',                   cuatrimestre: 3, orden: 2, creditos: 5 },
      { nombre: 'Diseño y Programación Web',                      cuatrimestre: 3, orden: 3, creditos: 4 },
      { nombre: 'Pensamiento Crítico',                            cuatrimestre: 4, orden: 1, creditos: 3 },
      { nombre: 'Proyecto Integrador 1',                          cuatrimestre: 4, orden: 2, creditos: 5 },
      { nombre: 'Fundamentos de Bases de Datos',                  cuatrimestre: 5, orden: 1, creditos: 4 },
      { nombre: 'Programación Orientada a Objetos',               cuatrimestre: 5, orden: 2, creditos: 5 },
      { nombre: 'Estructuras de Datos',                           cuatrimestre: 5, orden: 3, creditos: 3 },
      { nombre: 'Inglés Conversacional 2',                        cuatrimestre: 6, orden: 1, creditos: 2 },
      { nombre: 'Programación Web Avanzada',                      cuatrimestre: 6, orden: 2, creditos: 4 },
      { nombre: 'Arquitectura de Software',                       cuatrimestre: 6, orden: 3, creditos: 3 },
      { nombre: 'Proyecto Integrador 2',                          cuatrimestre: 7, orden: 1, creditos: 5 },
    ],
  },
  {
    slug: 'tecnico-desarrollo-web-avanzado',
    titulo: 'Técnico en Desarrollo y Diseño Web Avanzado',
    tipo: 'tecnico', nivel: 'tecnico',
    descripcion: 'Diseñado para formar profesionales altamente competitivos en un mercado digital en constante evolución. Combina diseño, programación y gestión de plataformas web para desarrollar soluciones completas, escalables y alineadas con las últimas tendencias.',
    duracionCuatrimestres: 7,
    tecnologias: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'HTML/CSS', 'SQL', 'Figma', 'Git'],
    objetivo: 'Formar desarrolladores web full-stack capaces de crear aplicaciones modernas, accesibles y centradas en la experiencia del usuario.',
    cursos: [
      { code: 'FUN-01',  nombre: 'Introducción a las Tecnologías de Información',   cuatrimestre: 1, orden: 1, creditos: 3 },
      { code: 'FUN-08',  nombre: 'Expresión Oral y Escrita',                         cuatrimestre: 1, orden: 2, creditos: 3 },
      { code: 'SOFT-28', nombre: 'Introducción al Diseño y Desarrollo Web',          cuatrimestre: 1, orden: 3, creditos: 3 },
      { code: 'SOFT-01', nombre: 'Principios de Programación 1',                     cuatrimestre: 2, orden: 1, creditos: 5 },
      { code: 'SOFT-29', nombre: 'Diseño Web 1',                                     cuatrimestre: 2, orden: 2, creditos: 4 },
      { code: 'SOFT-30', nombre: 'Programación Web 1',                               cuatrimestre: 3, orden: 1, creditos: 5 },
      { code: 'SOFT-39', nombre: 'Experiencia-Interfaz de Usuario UX-UI',            cuatrimestre: 3, orden: 2, creditos: 4 },
      { code: 'FUN-09',  nombre: 'Desarrollo de Habilidades Blandas',                cuatrimestre: 4, orden: 1, creditos: 3 },
      { code: 'SOFT-31', nombre: 'Proyecto Integrador Web 1',                        cuatrimestre: 4, orden: 2, creditos: 5 },
      { code: 'SOFT-03', nombre: 'Fundamentos de Bases de Datos',                    cuatrimestre: 5, orden: 1, creditos: 4 },
      { code: 'SOFT-32', nombre: 'Programación Web 2',                               cuatrimestre: 5, orden: 2, creditos: 5 },
      { code: 'SOFT-38', nombre: 'Administración y Posicionamiento de Sitios Web',   cuatrimestre: 5, orden: 3, creditos: 3 },
      { code: 'SOFT-33', nombre: 'Diseño Web 2',                                     cuatrimestre: 6, orden: 1, creditos: 4 },
      { code: 'SOFT-34', nombre: 'Programación Web 3',                               cuatrimestre: 6, orden: 2, creditos: 5 },
      { code: 'SOFT-40', nombre: 'Proyecto Integrador Web 2',                        cuatrimestre: 7, orden: 1, creditos: 5 },
    ],
  },

  // ── Técnicos N2 ───────────────────────────────────────────────────
  {
    slug: 'tecnico-desarrollo-software',
    titulo: 'Técnico en Desarrollo de Software',
    tipo: 'tecnico', nivel: 'tecnico',
    descripcion: 'Formación integral diseñada para proporcionarte las habilidades esenciales del desarrollo de software. Desarrollarás competencias digitales, socioemocionales y técnicas para enfrentar los desafíos de una industria en constante cambio.',
    duracionCuatrimestres: 4,
    tecnologias: ['JavaScript', 'Python', 'HTML/CSS', 'SQL', 'Git'],
    objetivo: 'Proporcionar las bases prácticas del desarrollo de software para que el estudiante pueda incorporarse a la industria como programador junior.',
    cursos: [
      { nombre: 'Introducción a las Tecnologías de Información', cuatrimestre: 1, orden: 1, creditos: 3 },
      { nombre: 'Expresión Oral y Escrita',                      cuatrimestre: 1, orden: 2, creditos: 3 },
      { nombre: 'Introducción a la Ing. del Software',           cuatrimestre: 1, orden: 3, creditos: 3 },
      { nombre: 'Desarrollo de Habilidades Blandas',             cuatrimestre: 2, orden: 1, creditos: 3 },
      { nombre: 'Principios de Programación 1',                  cuatrimestre: 2, orden: 2, creditos: 5 },
      { nombre: 'Inglés Conversacional 1',                       cuatrimestre: 3, orden: 1, creditos: 2 },
      { nombre: 'Principios de Programación 2',                  cuatrimestre: 3, orden: 2, creditos: 5 },
      { nombre: 'Diseño y Programación Web',                     cuatrimestre: 3, orden: 3, creditos: 4 },
      { nombre: 'Pensamiento Crítico',                           cuatrimestre: 4, orden: 1, creditos: 3 },
      { nombre: 'Proyecto Integrador 1',                         cuatrimestre: 4, orden: 2, creditos: 5 },
    ],
  },
  {
    slug: 'tecnico-desarrollo-diseno-web',
    titulo: 'Técnico en Desarrollo y Diseño Web',
    tipo: 'tecnico', nivel: 'tecnico',
    descripcion: 'Programa especializado en la creación y optimización de interfaces digitales, con un enfoque sólido en Front-End. Diseñás y desarrollás sitios web modernos, garantizando experiencias de usuario intuitivas, funcionales y centradas en el usuario.',
    duracionCuatrimestres: 4,
    tecnologias: ['HTML5', 'CSS3', 'JavaScript', 'Figma', 'UX/UI', 'Responsive Design'],
    objetivo: 'Formar desarrolladores web Front-End capaces de crear interfaces digitales modernas y centradas en la experiencia del usuario.',
    cursos: [
      { code: 'FUN-01',  nombre: 'Introducción a las Tecnologías de Información', cuatrimestre: 1, orden: 1, creditos: 3 },
      { code: 'FUN-08',  nombre: 'Expresión Oral y Escrita',                       cuatrimestre: 1, orden: 2, creditos: 3 },
      { code: 'SOFT-28', nombre: 'Introducción al Diseño y Desarrollo Web',         cuatrimestre: 1, orden: 3, creditos: 3 },
      { code: 'SOFT-01', nombre: 'Principios de Programación 1',                    cuatrimestre: 2, orden: 1, creditos: 5 },
      { code: 'SOFT-29', nombre: 'Diseño Web 1',                                    cuatrimestre: 2, orden: 2, creditos: 4 },
      { code: 'SOFT-30', nombre: 'Programación Web 1',                              cuatrimestre: 3, orden: 1, creditos: 5 },
      { code: 'SOFT-39', nombre: 'Experiencia-Interfaz de Usuario UX-UI',           cuatrimestre: 3, orden: 2, creditos: 4 },
      { code: 'FUN-09',  nombre: 'Desarrollo de Habilidades Blandas',               cuatrimestre: 4, orden: 1, creditos: 3 },
      { code: 'SOFT-31', nombre: 'Proyecto Integrador Web 1',                       cuatrimestre: 4, orden: 2, creditos: 5 },
    ],
  },

  // ── Técnico ágil: Diseño UX ───────────────────────────────────────
  {
    slug: 'tecnico-diseno-grafico-web-ux',
    titulo: 'Técnico en Diseño Gráfico Web y Experiencia de Usuario',
    tipo: 'tecnico', nivel: 'tecnico',
    descripcion: 'Desarrollá tus habilidades para crear y comunicar ideas utilizando herramientas y principios de diseño, experiencia de usuario y design thinking. El diseño correcto, centrado en el usuario, es hoy una ventaja competitiva clave en la industria digital.',
    duracionCuatrimestres: 12,
    tecnologias: ['Figma', 'Adobe XD', 'HTML/CSS', 'Design Thinking', 'UX Research', 'Prototyping'],
    objetivo: 'Formar diseñadores capaces de crear experiencias digitales centradas en el usuario, desde la investigación hasta el prototipado de alta fidelidad.',
    cursos: [
      { code: 'SOFT-329', nombre: 'Diseño Gráfico 1',                      cuatrimestre: 1,  orden: 1, creditos: 3 },
      { code: 'SOFT-330', nombre: 'Diseño Gráfico 2',                      cuatrimestre: 1,  orden: 2, creditos: 3 },
      { code: 'SOFT-331', nombre: 'Diseño Visual Digital 1',               cuatrimestre: 2,  orden: 1, creditos: 3 },
      { code: 'SOFT-332', nombre: 'Diseño Visual Digital 2',               cuatrimestre: 2,  orden: 2, creditos: 3 },
      { code: 'SOFT-343', nombre: 'Diseño Responsivo 1',                   cuatrimestre: 3,  orden: 1, creditos: 3 },
      { code: 'SOFT-344', nombre: 'Diseño Responsivo 2',                   cuatrimestre: 3,  orden: 2, creditos: 3 },
      { code: 'SOFT-334', nombre: 'Introducción a Design Thinking',        cuatrimestre: 4,  orden: 1, creditos: 3 },
      { code: 'SOFT-342', nombre: 'Fundamentos UX',                        cuatrimestre: 4,  orden: 2, creditos: 3 },
      { code: 'SOFT-333', nombre: 'UX Avanzado',                           cuatrimestre: 5,  orden: 1, creditos: 3 },
      { code: 'SOFT-346', nombre: 'Interfaces visuales con FIGMA',         cuatrimestre: 5,  orden: 2, creditos: 3 },
      { code: 'FUN-450',  nombre: 'Inteligencia Emocional aplicada 1',     cuatrimestre: 6,  orden: 1, creditos: 3 },
      { code: 'SOFT-347', nombre: 'Portafolio Profesional',                cuatrimestre: 6,  orden: 2, creditos: 3 },
      { code: 'SOFT-335', nombre: 'Proyecto de Diseño UX 1',               cuatrimestre: 6,  orden: 3, creditos: 3 },
    ],
  },

  // ── Técnicos ágiles: Testing ──────────────────────────────────────
  {
    slug: 'testing-manual-software',
    titulo: 'Testing Manual de Software',
    tipo: 'tecnico', nivel: 'tecnico',
    descripcion: 'Fundamentos del testing, diseño de casos de prueba, gestión de defectos y herramientas de QA. Formación orientada al estándar ISTQB Foundation Level.',
    duracionCuatrimestres: 2,
    tecnologias: ['JIRA', 'TestRail', 'Postman', 'Zephyr', 'Confluence'],
    objetivo: 'Formar testers manuales capaces de diseñar y ejecutar planes de prueba, reportar defectos y asegurar la calidad en proyectos ágiles.',
    cursos: [],
  },
  {
    slug: 'automatizacion-pruebas-software',
    titulo: 'Automatización de Pruebas de Software',
    tipo: 'tecnico', nivel: 'tecnico',
    descripcion: 'Frameworks de automatización, CI/CD, scripting y estrategias de testing automatizado. Incluye Selenium, Cypress, Playwright y pruebas de API.',
    duracionCuatrimestres: 2,
    tecnologias: ['Selenium', 'Cypress', 'Playwright', 'Postman', 'Python', 'JavaScript', 'Jenkins', 'GitHub Actions'],
    objetivo: 'Formar automatizadores de pruebas capaces de implementar frameworks de testing, integrar pipelines CI/CD y reducir el tiempo de regresión en equipos ágiles.',
    cursos: [],
  },
  {
    slug: 'testing-software-ia-sistemas-inteligentes',
    titulo: 'Testing de Software con IA y Sistemas Inteligentes',
    tipo: 'tecnico', nivel: 'tecnico',
    descripcion: 'Testing potenciado con inteligencia artificial: análisis predictivo de defectos, generación automática de pruebas y optimización de cobertura.',
    duracionCuatrimestres: 2,
    tecnologias: ['Python', 'ML Testing', 'Testim', 'Applitools', 'Mabl'],
    objetivo: 'Formar testers capaces de aplicar IA en procesos de calidad: generación automática de casos de prueba, análisis predictivo y validación de sistemas de IA.',
    cursos: [],
  },

  // ── Paths de microciclos ──────────────────────────────────────────
  {
    slug: 'python-foundations',
    titulo: 'Python Foundations: Programación Aplicada desde Cero',
    tipo: 'tecnico', nivel: 'tecnico',
    descripcion: 'Programa base, nivelatorio y propedéutico para aprender a programar desde cero con Python. Puerta de entrada a todos los paths técnicos especializados: bases de datos, testing, IA y automatización.',
    duracionCuatrimestres: 6,
    tecnologias: ['Python', 'Git', 'SQLite', 'PostgreSQL', 'pytest', 'APIs REST'],
    objetivo: 'Proporcionar las bases de programación en Python necesarias para ingresar a cualquier path técnico especializado de ESOFT.',
    cursos: [],
  },
  {
    slug: 'path-sql-bases-datos-relacionales',
    titulo: 'Desarrollo SQL y Bases de Datos Relacionales',
    tipo: 'ruta_corporativa', nivel: 'tecnico',
    descripcion: 'Dominá el diseño, implementación y optimización de bases de datos relacionales. 13 microciclos · 304 horas · Desde modelado conceptual hasta procedimientos almacenados y reporting empresarial.',
    duracionCuatrimestres: 13,
    tecnologias: ['PostgreSQL', 'MySQL', 'SQL', 'Modelado E-R', 'DBeaver', 'Power BI'],
    objetivo: 'Formar técnicos capaces de diseñar, implementar y optimizar bases de datos relacionales para aplicaciones empresariales.',
    cursos: [],
  },
  {
    slug: 'path-nosql-distribuidas',
    titulo: 'Bases de Datos NoSQL y Distribuidas',
    tipo: 'ruta_corporativa', nivel: 'tecnico',
    descripcion: 'Explorá los principales modelos NoSQL: documental, key-value, column-family y grafos. 12 microciclos · 280 horas · MongoDB, Redis, Cassandra y bases distribuidas para aplicaciones modernas.',
    duracionCuatrimestres: 12,
    tecnologias: ['MongoDB', 'Redis', 'Cassandra', 'Neo4j', 'Python', 'Docker'],
    objetivo: 'Formar técnicos capaces de seleccionar, diseñar e implementar bases de datos NoSQL para resolver problemas de escala, flexibilidad y rendimiento.',
    cursos: [],
  },
  {
    slug: 'path-vectoriales-ia-rag',
    titulo: 'Bases de Datos Vectoriales, IA Generativa y RAG',
    tipo: 'ruta_corporativa', nivel: 'tecnico',
    descripcion: 'Implementá sistemas de búsqueda semántica y aplicaciones con Retrieval-Augmented Generation. 14 microciclos · 328 horas · Embeddings, vectores, LLMs y arquitecturas RAG empresariales.',
    duracionCuatrimestres: 14,
    tecnologias: ['Python', 'Pinecone', 'Qdrant', 'LangChain', 'OpenAI', 'Hugging Face', 'PostgreSQL pgvector'],
    objetivo: 'Formar técnicos capaces de implementar sistemas RAG y aplicaciones con IA generativa usando bases de datos vectoriales.',
    cursos: [],
  },
]

// ── Rutas de aprendizaje ────────────────────────────────────────────

const RUTAS: RutaDef[] = [
  {
    slug: 'desarrollo-software',
    titulo: 'Ruta: Desarrollo de Software',
    descripcion: 'Dominá el desarrollo full-stack: front-end, back-end, APIs, bases de datos y despliegue en la nube. Desde técnico hasta ingeniero senior.',
    programaSlugs: [
      'tecnico-desarrollo-software',
      'tecnico-ingenieria-software',
      'tecnico-desarrollo-web-avanzado',
      'bachillerato-ingenieria-software',
    ],
  },
  {
    slug: 'inteligencia-artificial',
    titulo: 'Ruta: Inteligencia Artificial',
    descripcion: 'Desarrollá sistemas inteligentes, modelos de machine learning y soluciones de IA aplicadas al software.',
    programaSlugs: [
      'python-foundations',
      'tecnico-ingenieria-software',
      'bachillerato-ingenieria-software',
      'maestria-ingenieria-software-ia',
    ],
  },
  {
    slug: 'arquitectura-software',
    titulo: 'Ruta: Arquitectura de Software',
    descripcion: 'Diseñá sistemas escalables, resilientes y bien estructurados. Liderá decisiones técnicas a nivel enterprise.',
    programaSlugs: [
      'bachillerato-ingenieria-software',
      'maestria-arquitectura-diseno-software',
    ],
  },
  {
    slug: 'software-testing',
    titulo: 'Ruta: Software Testing',
    descripcion: 'Convertite en un QA engineer completo. Desde las bases del testing manual hasta automatización avanzada e inteligencia artificial aplicada al aseguramiento de calidad.',
    programaSlugs: [
      'testing-manual-software',
      'automatizacion-pruebas-software',
      'testing-software-ia-sistemas-inteligentes',
    ],
  },
  {
    slug: 'ux-ui',
    titulo: 'Ruta: UX/UI Design',
    descripcion: 'Diseñá experiencias digitales centradas en el usuario. Desde investigación de usuarios hasta prototipado y diseño de producto.',
    programaSlugs: [
      'tecnico-diseno-grafico-web-ux',
    ],
  },
]

// ── Runner ──────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Iniciando seed de la base de datos ESOFT...\n')

  // Limpiar en orden seguro (respetando FK)
  console.log('→ Limpiando tablas...')
  await db.delete(cursosTable)
  await db.delete(rutasTable)
  await db.delete(programas)

  // Insertar programas y recopilar IDs
  console.log(`→ Insertando ${PROGRAMAS.length} programas...`)
  const idPorSlug = new Map<string, string>()

  for (const p of PROGRAMAS) {
    const { cursos: cursosData, ...data } = p
    const [inserted] = await db.insert(programas).values({
      slug:                   data.slug,
      titulo:                 data.titulo,
      tipo:                   data.tipo,
      nivel:                  data.nivel,
      descripcion:            data.descripcion,
      duracionCuatrimestres:  data.duracionCuatrimestres,
      tecnologias:            data.tecnologias,
      objetivo:               data.objetivo ?? null,
      perfilEgresado:         data.perfilEgresado ?? null,
      activo:                 true,
    }).returning()

    idPorSlug.set(inserted.slug, inserted.id)

    // Insertar cursos del programa
    if (cursosData.length > 0) {
      await db.insert(cursosTable).values(
        cursosData.map(c => ({
          programaId:   inserted.id,
          nombre:       c.nombre,
          cuatrimestre: c.cuatrimestre,
          orden:        c.orden,
          creditos:     c.creditos ?? null,
          descripcion:  null,
        }))
      )
    }

    const cursosCount = cursosData.length > 0 ? ` (${cursosData.length} cursos)` : ''
    console.log(`  ✓ ${data.titulo}${cursosCount}`)
  }

  // Insertar rutas con los IDs resueltos
  console.log(`\n→ Insertando ${RUTAS.length} rutas de aprendizaje...`)
  for (const r of RUTAS) {
    const programaIds = r.programaSlugs
      .map(s => idPorSlug.get(s))
      .filter((id): id is string => Boolean(id))

    await db.insert(rutasTable).values({
      slug:        r.slug,
      titulo:      r.titulo,
      descripcion: r.descripcion,
      programaIds,
      activo:      true,
    })

    console.log(`  ✓ ${r.titulo} → ${programaIds.length} programas`)
  }

  const totalCursos = PROGRAMAS.reduce((acc, p) => acc + p.cursos.length, 0)
  console.log(`
✅ Seed completado:
   • ${PROGRAMAS.length} programas
   • ${totalCursos} cursos
   • ${RUTAS.length} rutas
`)

  await pool.end()
}

seed().catch(err => {
  console.error('❌ Error en el seed:', err)
  process.exit(1)
})
