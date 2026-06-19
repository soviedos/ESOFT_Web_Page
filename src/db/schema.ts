import {
  pgTable, pgEnum,
  uuid, varchar, text, boolean, integer, timestamp, jsonb, vector,
  uniqueIndex, index,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const rolEnum = pgEnum('rol', ['admin', 'docente'])
export const modalidadPrograma = pgEnum('modalidad_programa', ['cuatrimestral', 'path', 'curso_360', 'curso_continuo'])
export const nivelPrograma = pgEnum('nivel_programa', ['tecnico', 'bachillerato', 'maestria'])
export const tipoUnidad = pgEnum('tipo_unidad', ['curso', 'microciclo', 'modulo_360'])
export const nivelCredencial = pgEnum('nivel_credencial', ['foundational', 'professional', 'advanced', 'expert'])

export const areasCurriculares = pgTable('areas_curriculares', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 200 }).notNull(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  descripcion: text('descripcion'),
  orden: integer('orden').notNull().default(0),
  activo: boolean('activo').notNull().default(true),
}, (t) => ({ slugIdx: uniqueIndex('areas_slug_idx').on(t.slug) }))

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  rol: rolEnum('rol').notNull().default('docente'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({ emailIdx: uniqueIndex('users_email_idx').on(t.email) }))

export const docentes = pgTable('docentes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  titulo: varchar('titulo', { length: 300 }).notNull(),
  bio: text('bio'),
  fotoUrl: varchar('foto_url', { length: 500 }),
  especialidades: jsonb('especialidades').$type<string[]>().default([]),
  linkedin: varchar('linkedin', { length: 500 }),
  activo: boolean('activo').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({ userIdx: uniqueIndex('docentes_user_idx').on(t.userId) }))

export const programas = pgTable('programas', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 200 }).notNull(),
  titulo: varchar('titulo', { length: 300 }).notNull(),
  modalidad: modalidadPrograma('modalidad').notNull(),
  nivel: nivelPrograma('nivel'),
  areaCurricularId: uuid('area_curricular_id').references(() => areasCurriculares.id, { onDelete: 'set null' }),
  prerequisitoId: uuid('prerequisito_id').references((): AnyPgColumn => programas.id, { onDelete: 'set null' }),
  nivelCredencial: nivelCredencial('nivel_credencial'),
  descripcion: text('descripcion').notNull(),
  duracionCuatrimestres: integer('duracion_cuatrimestres'),
  totalMicrociclos: integer('total_microciclos'),
  duracionHoras: integer('duracion_horas'),
  microcredencial: varchar('microcredencial', { length: 300 }),
  badgeUrl: varchar('badge_url', { length: 500 }),
  estadisticas: jsonb('estadisticas').$type<{ label: string; valor: string }[]>().default([]),
  tecnologias: jsonb('tecnologias').$type<string[]>().default([]),
  objetivo: text('objetivo'),
  perfilEgresado: text('perfil_egresado'),
  activo: boolean('activo').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  slugIdx: uniqueIndex('programas_slug_idx').on(t.slug),
  modalidadIdx: index('programas_modalidad_idx').on(t.modalidad),
  areaIdx: index('programas_area_idx').on(t.areaCurricularId),
}))

export const cursos = pgTable('cursos', {
  id: uuid('id').defaultRandom().primaryKey(),
  programaId: uuid('programa_id').notNull().references(() => programas.id, { onDelete: 'cascade' }),
  tipo: tipoUnidad('tipo').notNull().default('curso'),
  codigo: varchar('codigo', { length: 30 }),
  nombre: varchar('nombre', { length: 300 }).notNull(),
  secuencia: integer('secuencia').notNull().default(1),
  cuatrimestre: integer('cuatrimestre'),
  orden: integer('orden').notNull().default(0),
  descripcion: text('descripcion'),
  horasLectivas: integer('horas_lectivas'),
  horasPracticas: integer('horas_practicas'),
  horasEstudio: integer('horas_estudio'),
  creditos: integer('creditos'),
}, (t) => ({
  programaIdx: index('cursos_programa_idx').on(t.programaId),
  tipoIdx: index('cursos_tipo_idx').on(t.tipo),
}))

export const competencias = pgTable('competencias', {
  id: uuid('id').defaultRandom().primaryKey(),
  programaId: uuid('programa_id').notNull().references(() => programas.id, { onDelete: 'cascade' }),
  cursoId: uuid('curso_id').references(() => cursos.id, { onDelete: 'set null' }),
  nombre: varchar('nombre', { length: 300 }).notNull(),
  descripcion: text('descripcion'),
  microcredencial: varchar('microcredencial', { length: 300 }),
  sfiaCodigo: varchar('sfia_codigo', { length: 20 }),
  sfiaNivel: integer('sfia_nivel'),
  orden: integer('orden').notNull().default(0),
  activo: boolean('activo').notNull().default(true),
}, (t) => ({
  programaIdx: index('competencias_programa_idx').on(t.programaId),
  cursoIdx: index('competencias_curso_idx').on(t.cursoId),
}))

// Corpus del RAG: fragmentos de texto de un programa con su embedding.
export interface ChunkMetadata {
  programaSlug?: string
  titulo?: string
  modalidad?: string
  area?: string | null
}

export const chunks = pgTable('chunks', {
  id: uuid('id').defaultRandom().primaryKey(),
  programaId: uuid('programa_id').notNull().references(() => programas.id, { onDelete: 'cascade' }),
  seccion: varchar('seccion', { length: 50 }).notNull(),
  contenido: text('contenido').notNull(),
  embedding: vector('embedding', { dimensions: 768 }).notNull(),
  metadata: jsonb('metadata').$type<ChunkMetadata>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  programaIdx: index('chunks_programa_idx').on(t.programaId),
  // Índice HNSW para búsqueda por distancia coseno (embedding <=> query).
  embeddingIdx: index('chunks_embedding_hnsw_idx').using('hnsw', t.embedding.op('vector_cosine_ops')),
}))

export const rutas = pgTable('rutas', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 200 }).notNull(),
  titulo: varchar('titulo', { length: 300 }).notNull(),
  descripcion: text('descripcion'),
  areaCurricularId: uuid('area_curricular_id').references(() => areasCurriculares.id, { onDelete: 'set null' }),
  programaIds: jsonb('programa_ids').$type<string[]>().default([]),
  activo: boolean('activo').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({ slugIdx: uniqueIndex('rutas_slug_idx').on(t.slug) }))

export const bloquesContenido = pgTable('bloques_contenido', {
  id: uuid('id').defaultRandom().primaryKey(),
  clave: varchar('clave', { length: 200 }).notNull(),
  titulo: varchar('titulo', { length: 300 }),
  cuerpo: text('cuerpo'),
  seccion: varchar('seccion', { length: 120 }),
  orden: integer('orden').notNull().default(0),
  activo: boolean('activo').notNull().default(true),
  actualizadoEn: timestamp('actualizado_en').defaultNow().notNull(),
  actualizadoPor: uuid('actualizado_por').references(() => users.id, { onDelete: 'set null' }),
}, (t) => ({ claveIdx: uniqueIndex('bloques_clave_idx').on(t.clave) }))

export const noticias = pgTable('noticias', {
  id: uuid('id').defaultRandom().primaryKey(),
  autorId: uuid('autor_id').references(() => users.id, { onDelete: 'set null' }),
  titulo: varchar('titulo', { length: 400 }).notNull(),
  slug: varchar('slug', { length: 400 }).notNull(),
  contenido: text('contenido').notNull(),
  imagenUrl: varchar('imagen_url', { length: 500 }),
  publicado: boolean('publicado').notNull().default(false),
  publicadoEn: timestamp('publicado_en'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({ slugIdx: uniqueIndex('noticias_slug_idx').on(t.slug) }))

export const solicitudes = pgTable('solicitudes', {
  id: uuid('id').defaultRandom().primaryKey(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  telefono: varchar('telefono', { length: 30 }),
  programaId: uuid('programa_id').references(() => programas.id, { onDelete: 'set null' }),
  mensaje: text('mensaje'),
  leido: boolean('leido').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  emailIdx: index('solicitudes_email_idx').on(t.email),
  leidoIdx: index('solicitudes_leido_idx').on(t.leido),
}))

export const areasRelations = relations(areasCurriculares, ({ many }) => ({ programas: many(programas), rutas: many(rutas) }))
export const usersRelations = relations(users, ({ one, many }) => ({ docente: one(docentes, { fields: [users.id], references: [docentes.userId] }), noticias: many(noticias) }))
export const docentesRelations = relations(docentes, ({ one }) => ({ user: one(users, { fields: [docentes.userId], references: [users.id] }) }))
export const programasRelations = relations(programas, ({ one, many }) => ({
  area: one(areasCurriculares, { fields: [programas.areaCurricularId], references: [areasCurriculares.id] }),
  prerequisito: one(programas, { fields: [programas.prerequisitoId], references: [programas.id], relationName: 'prerequisito' }),
  cursos: many(cursos),
  competencias: many(competencias),
  solicitudes: many(solicitudes),
  chunks: many(chunks),
}))
export const chunksRelations = relations(chunks, ({ one }) => ({ programa: one(programas, { fields: [chunks.programaId], references: [programas.id] }) }))
export const cursosRelations = relations(cursos, ({ one, many }) => ({ programa: one(programas, { fields: [cursos.programaId], references: [programas.id] }), competencias: many(competencias) }))
export const competenciasRelations = relations(competencias, ({ one }) => ({ programa: one(programas, { fields: [competencias.programaId], references: [programas.id] }), curso: one(cursos, { fields: [competencias.cursoId], references: [cursos.id] }) }))
export const rutasRelations = relations(rutas, ({ one }) => ({ area: one(areasCurriculares, { fields: [rutas.areaCurricularId], references: [areasCurriculares.id] }) }))
export const noticiasRelations = relations(noticias, ({ one }) => ({ autor: one(users, { fields: [noticias.autorId], references: [users.id] }) }))
export const solicitudesRelations = relations(solicitudes, ({ one }) => ({ programa: one(programas, { fields: [solicitudes.programaId], references: [programas.id] }) }))
