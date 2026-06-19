/**
 * Seed de la BD ESOFT — modelo académico nuevo.
 * Ejecutar: npm run db:seed
 * Requiere DATABASE_URL en .env (o como variable de entorno).
 *
 * ADVERTENCIA: borra y reinserta todo el contenido académico
 * (competencias, cursos, solicitudes, rutas, bloques, noticias, programas,
 *  docentes, users, áreas curriculares).
 */

import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema.js'
import {
  areasCurriculares,
  users,
  docentes,
  programas,
  cursos,
  competencias,
  rutas,
  bloquesContenido,
  noticias,
  solicitudes,
} from './schema.js'
import { hashPassword } from '../lib/password.js'

const _url = process.env.DATABASE_URL
if (!_url) throw new Error('DATABASE_URL no está definida. Pasa DATABASE_URL=... npm run db:seed')
const _pool = new Pool({ connectionString: _url })
const db = drizzle(_pool, { schema })

// ── Áreas curriculares ──────────────────────────────────────────────

const AREAS = [
  { slug: 'programacion',   nombre: 'Programación' },
  { slug: 'frontend',       nombre: 'Frontend' },
  { slug: 'backend',        nombre: 'Backend' },
  { slug: 'bases-de-datos', nombre: 'Bases de datos' },
  { slug: 'testing',        nombre: 'Testing' },
]

// ── Runner ──────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Iniciando seed de la base de datos ESOFT (modelo nuevo)...\n')

  // 1) Limpiar en orden seguro de FKs ─────────────────────────────────
  console.log('→ Limpiando tablas...')
  await db.delete(competencias)
  await db.delete(cursos)
  await db.delete(solicitudes)
  await db.delete(rutas)
  await db.delete(bloquesContenido)
  await db.delete(noticias)
  await db.delete(programas)
  await db.delete(docentes)
  await db.delete(users)
  await db.delete(areasCurriculares)

  const count = {
    users: 0, areas: 0, programas: 0, cursos: 0, competencias: 0, rutas: 0, bloques: 0,
  }

  // 2) Usuario admin ──────────────────────────────────────────────────
  console.log('→ Insertando usuario admin...')
  const [admin] = await db.insert(users).values({
    email:        'admin@esoft.cenfotec.ac.cr',
    passwordHash: await hashPassword('cambiar-en-produccion'),
    rol:          'admin',
  }).returning()
  count.users++

  // 3) Áreas curriculares ─────────────────────────────────────────────
  console.log(`→ Insertando ${AREAS.length} áreas curriculares...`)
  const areaIdPorSlug = new Map<string, string>()
  for (const [i, a] of AREAS.entries()) {
    const [row] = await db.insert(areasCurriculares).values({
      slug:   a.slug,
      nombre: a.nombre,
      orden:  i,
    }).returning()
    areaIdPorSlug.set(row.slug, row.id)
    count.areas++
  }

  // 4) Cuatrimestral — Técnico en Desarrollo y Diseño Web Avanzado ─────
  console.log('→ Insertando programa cuatrimestral...')
  const [cuatri] = await db.insert(programas).values({
    slug:                  'tecnico-desarrollo-diseno-web-avanzado',
    titulo:                'Técnico en Desarrollo y Diseño Web Avanzado',
    modalidad:             'cuatrimestral',
    nivel:                 'tecnico',
    descripcion:           'Programa técnico de desarrollo web full-stack: combina diseño, programación front-end y back-end para construir aplicaciones web modernas, accesibles y centradas en la experiencia del usuario.',
    duracionCuatrimestres: 4,
    tecnologias:           ['HTML', 'CSS', 'JavaScript', 'UX/UI'],
    activo:                true,
  }).returning()
  count.programas++

  // cursos (tipo 'curso'; secuencia = nº de cuatrimestre; orden dentro del cuatrimestre)
  const cuatriCursos = [
    { codigo: 'FUN-01',  nombre: 'Introducción a las tecnologías de información', cuatrimestre: 1, orden: 1, horasLectivas: 3, horasPracticas: 45, horasEstudio: 90,  creditos: 3 },
    { codigo: 'FUN-08',  nombre: 'Expresión oral y escrita',                      cuatrimestre: 1, orden: 2, horasLectivas: 3, horasPracticas: 45, horasEstudio: 90,  creditos: 3 },
    { codigo: 'SOFT-28', nombre: 'Introducción al diseño y desarrollo web',       cuatrimestre: 1, orden: 3, horasLectivas: 3, horasPracticas: 64, horasEstudio: 80,  creditos: 3 },
    { codigo: 'SOFT-01', nombre: 'Principios de programación 1',                  cuatrimestre: 2, orden: 1, horasLectivas: 6, horasPracticas: 90, horasEstudio: 135, creditos: 5 },
    { codigo: 'SOFT-29', nombre: 'Diseño web 1',                                  cuatrimestre: 2, orden: 2, horasLectivas: 4, horasPracticas: 64, horasEstudio: 128, creditos: 4 },
    { codigo: 'SOFT-30', nombre: 'Programación web 1',                            cuatrimestre: 3, orden: 1, horasLectivas: 4, horasPracticas: 64, horasEstudio: 176, creditos: 5 },
    { codigo: 'SOFT-39', nombre: 'Experiencia-Interfaz de usuario UX-UI',         cuatrimestre: 3, orden: 2, horasLectivas: 4, horasPracticas: 64, horasEstudio: 128, creditos: 4 },
    { codigo: 'FUN-09',  nombre: 'Desarrollo de habilidades blandas',            cuatrimestre: 4, orden: 1, horasLectivas: 3, horasPracticas: 45, horasEstudio: 90,  creditos: 3 },
    { codigo: 'SOFT-31', nombre: 'Proyecto integrador web 1',                     cuatrimestre: 4, orden: 2, horasLectivas: 8, horasPracticas: 128, horasEstudio: 112, creditos: 5 },
  ]
  await db.insert(cursos).values(
    cuatriCursos.map(c => ({
      programaId:     cuatri.id,
      tipo:           'curso' as const,
      codigo:         c.codigo,
      nombre:         c.nombre,
      secuencia:      c.cuatrimestre,
      cuatrimestre:   c.cuatrimestre,
      orden:          c.orden,
      horasLectivas:  c.horasLectivas,
      horasPracticas: c.horasPracticas,
      horasEstudio:   c.horasEstudio,
      creditos:       c.creditos,
    }))
  )
  count.cursos += cuatriCursos.length

  // 5) Path — Python Foundations ──────────────────────────────────────
  console.log('→ Insertando path Python Foundations...')
  const [python] = await db.insert(programas).values({
    slug:            'python-foundations',
    titulo:          'Python Foundations',
    modalidad:       'path',
    areaCurricularId: areaIdPorSlug.get('programacion'),
    nivelCredencial: 'foundational',
    descripcion:     'Path fundacional, base común para todas las rutas de conocimiento.',
    totalMicrociclos: 6,
    duracionHoras:   144,
    tecnologias:     ['Python'],
    activo:          true,
  }).returning()
  count.programas++

  // microciclos (tipo 'microciclo'; sin HL/HP/HE ni créditos)
  const [microSintaxis] = await db.insert(cursos).values({
    programaId: python.id,
    tipo:       'microciclo',
    nombre:     'Sintaxis y tipos',
    secuencia:  1,
    orden:      1,
  }).returning()
  const [microEstructuras] = await db.insert(cursos).values({
    programaId: python.id,
    tipo:       'microciclo',
    nombre:     'Estructuras de datos',
    secuencia:  2,
    orden:      2,
  }).returning()
  count.cursos += 2

  // competencias ligadas a cada microciclo por cursoId
  await db.insert(competencias).values([
    {
      programaId:  python.id,
      cursoId:     microSintaxis.id,
      nombre:      'Escribe scripts con estructuras de control y funciones',
      sfiaCodigo:  'PROG',
      sfiaNivel:   2,
      orden:       1,
    },
    {
      programaId:  python.id,
      cursoId:     microEstructuras.id,
      nombre:      'Manipula colecciones y archivos',
      sfiaCodigo:  'PROG',
      sfiaNivel:   3,
      orden:       2,
    },
  ])
  count.competencias += 2

  // 6) Curso 360 — Desarrollo full-stack web ──────────────────────────
  console.log('→ Insertando curso 360 Desarrollo full-stack web...')
  const [fullstack] = await db.insert(programas).values({
    slug:             'desarrollo-full-stack-web',
    titulo:           'Desarrollo full-stack web',
    modalidad:        'curso_360',
    areaCurricularId: areaIdPorSlug.get('frontend'),
    nivelCredencial:  'advanced',
    prerequisitoId:   python.id,
    descripcion:      'Curso 360 de desarrollo full-stack: del frontend con React al backend con Node, hasta la integración y el despliegue.',
    totalMicrociclos: 3,
    duracionHoras:    96,
    activo:           true,
  }).returning()
  count.programas++

  const fullstackModulos = ['Frontend con React', 'Backend con Node', 'Integración y despliegue']
  await db.insert(cursos).values(
    fullstackModulos.map((nombre, i) => ({
      programaId: fullstack.id,
      tipo:       'modulo_360' as const,
      nombre,
      secuencia:  i + 1,
      orden:      i + 1,
    }))
  )
  count.cursos += fullstackModulos.length

  // 7) Curso continuo — Testing manual de software ────────────────────
  console.log('→ Insertando curso continuo Testing manual de software...')
  const [testing] = await db.insert(programas).values({
    slug:             'testing-manual-de-software',
    titulo:           'Testing manual de software',
    modalidad:        'curso_continuo',
    areaCurricularId: areaIdPorSlug.get('testing'),
    nivelCredencial:  'foundational',
    descripcion:      'Curso continuo de fundamentos del testing manual: diseño y ejecución de casos de prueba, y gestión de defectos.',
    duracionHoras:    16,
    activo:           true,
  }).returning()
  count.programas++

  await db.insert(competencias).values({
    programaId: testing.id,
    nombre:     'Diseña y ejecuta casos de prueba manuales',
    sfiaCodigo: 'TEST',
    sfiaNivel:  2,
    orden:      1,
  })
  count.competencias++

  // 8) Ruta/colección transversal — Ruta full-stack web ───────────────
  console.log('→ Insertando ruta transversal...')
  await db.insert(rutas).values({
    slug:        'ruta-full-stack',
    titulo:      'Ruta full-stack web',
    descripcion: 'Combina fundamentos de programación, frontend y backend.',
    programaIds: [python.id, fullstack.id],
    activo:      true,
  })
  count.rutas++

  // 9) Bloque de contenido — Metodología XperiencEd ───────────────────
  console.log('→ Insertando bloque de contenido...')
  await db.insert(bloquesContenido).values({
    clave:          'metodologia-xperienced',
    titulo:         'Metodología XperiencEd',
    seccion:        'metodologia',
    cuerpo:         'XperiencEd es la metodología de aprendizaje de CENFOTEC, con una distribución de 20% teoría, 60% práctica y 20% reflexión. Es el pilar del modelo Credentials as you Grow, que acredita competencias de forma progresiva.',
    actualizadoPor: admin.id,
  })
  count.bloques++

  console.log(`
✅ Seed completado:
   • ${count.users} usuario admin
   • ${count.areas} áreas curriculares
   • ${count.programas} programas
   • ${count.cursos} cursos (curso/microciclo/modulo_360)
   • ${count.competencias} competencias
   • ${count.rutas} ruta transversal
   • ${count.bloques} bloque de contenido
`)

  await _pool.end()
}

seed().catch(err => {
  console.error('❌ Error en el seed:', err)
  process.exit(1)
})
