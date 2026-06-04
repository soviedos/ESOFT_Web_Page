import {
  pgTable, pgEnum,
  uuid, varchar, text, boolean, integer, timestamp, jsonb,
  uniqueIndex, index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ── Enums ─────────────────────────────────────────────────────────

export const rolEnum = pgEnum('rol', ['admin', 'docente'])

export const tipoPrograma = pgEnum('tipo_programa', [
  'bachillerato',
  'maestria',
  'tecnico',
  'ruta_corporativa',
])

export const nivelPrograma = pgEnum('nivel_programa', [
  'tecnico',
  'bachillerato',
  'maestria',
])

// ── Tabla: users ─────────────────────────────────────────────────

export const users = pgTable('users', {
  id:           uuid('id').defaultRandom().primaryKey(),
  email:        varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  rol:          rolEnum('rol').notNull().default('docente'),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  emailIdx: uniqueIndex('users_email_idx').on(t.email),
}))

// ── Tabla: docentes ───────────────────────────────────────────────

export const docentes = pgTable('docentes', {
  id:            uuid('id').defaultRandom().primaryKey(),
  userId:        uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  nombre:        varchar('nombre', { length: 200 }).notNull(),
  titulo:        varchar('titulo', { length: 300 }).notNull(),
  bio:           text('bio'),
  fotoUrl:       varchar('foto_url', { length: 500 }),
  especialidades: jsonb('especialidades').$type<string[]>().default([]),
  linkedin:      varchar('linkedin', { length: 500 }),
  activo:        boolean('activo').notNull().default(true),
  updatedAt:     timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  userIdx: uniqueIndex('docentes_user_idx').on(t.userId),
}))

// ── Tabla: programas ─────────────────────────────────────────────

export const programas = pgTable('programas', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  slug:                varchar('slug', { length: 200 }).notNull(),
  titulo:              varchar('titulo', { length: 300 }).notNull(),
  tipo:                tipoPrograma('tipo').notNull(),
  nivel:               nivelPrograma('nivel').notNull(),
  descripcion:         text('descripcion').notNull(),
  duracionCuatrimestres: integer('duracion_cuatrimestres').notNull(),
  estadisticas:        jsonb('estadisticas').$type<{ label: string; valor: string }[]>().default([]),
  tecnologias:         jsonb('tecnologias').$type<string[]>().default([]),
  objetivo:        text('objetivo'),
  perfilEgresado:  text('perfil_egresado'),
  activo:          boolean('activo').notNull().default(true),
  createdAt:           timestamp('created_at').defaultNow().notNull(),
  updatedAt:           timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  slugIdx: uniqueIndex('programas_slug_idx').on(t.slug),
  tipoIdx: index('programas_tipo_idx').on(t.tipo),
}))

// ── Tabla: cursos (plan de estudios) ─────────────────────────────

export const cursos = pgTable('cursos', {
  id:          uuid('id').defaultRandom().primaryKey(),
  programaId:  uuid('programa_id').notNull().references(() => programas.id, { onDelete: 'cascade' }),
  nombre:      varchar('nombre', { length: 300 }).notNull(),
  cuatrimestre: integer('cuatrimestre').notNull(),
  orden:       integer('orden').notNull().default(0),
  descripcion: text('descripcion'),
  creditos:    integer('creditos'),
}, (t) => ({
  programaIdx: index('cursos_programa_idx').on(t.programaId),
}))

// ── Tabla: rutas ─────────────────────────────────────────────────
// Una ruta agrupa programas relacionados (ej: "Ruta IA")
// Se recalcula automáticamente vía trigger o al guardar un programa

export const rutas = pgTable('rutas', {
  id:          uuid('id').defaultRandom().primaryKey(),
  slug:        varchar('slug', { length: 200 }).notNull(),
  titulo:      varchar('titulo', { length: 300 }).notNull(),
  descripcion: text('descripcion'),
  programaIds: jsonb('programa_ids').$type<string[]>().default([]),
  activo:      boolean('activo').notNull().default(true),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  slugIdx: uniqueIndex('rutas_slug_idx').on(t.slug),
}))

// ── Tabla: noticias ───────────────────────────────────────────────

export const noticias = pgTable('noticias', {
  id:          uuid('id').defaultRandom().primaryKey(),
  autorId:     uuid('autor_id').references(() => users.id, { onDelete: 'set null' }),
  titulo:      varchar('titulo', { length: 400 }).notNull(),
  slug:        varchar('slug', { length: 400 }).notNull(),
  contenido:   text('contenido').notNull(),
  imagenUrl:   varchar('imagen_url', { length: 500 }),
  publicado:   boolean('publicado').notNull().default(false),
  publicadoEn: timestamp('publicado_en'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  slugIdx: uniqueIndex('noticias_slug_idx').on(t.slug),
}))

// ── Tabla: solicitudes ────────────────────────────────────────────

export const solicitudes = pgTable('solicitudes', {
  id:         uuid('id').defaultRandom().primaryKey(),
  nombre:     varchar('nombre', { length: 200 }).notNull(),
  email:      varchar('email', { length: 255 }).notNull(),
  telefono:   varchar('telefono', { length: 30 }),
  programaId: uuid('programa_id').references(() => programas.id, { onDelete: 'set null' }),
  mensaje:    text('mensaje'),
  leido:      boolean('leido').notNull().default(false),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  emailIdx: index('solicitudes_email_idx').on(t.email),
  leidoIdx: index('solicitudes_leido_idx').on(t.leido),
}))

// ── Relaciones (para queries con join tipado) ─────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  docente:    one(docentes, { fields: [users.id], references: [docentes.userId] }),
  noticias:   many(noticias),
}))

export const docentesRelations = relations(docentes, ({ one }) => ({
  user: one(users, { fields: [docentes.userId], references: [users.id] }),
}))

export const programasRelations = relations(programas, ({ many }) => ({
  cursos:      many(cursos),
  solicitudes: many(solicitudes),
}))

export const cursosRelations = relations(cursos, ({ one }) => ({
  programa: one(programas, { fields: [cursos.programaId], references: [programas.id] }),
}))

export const noticiasRelations = relations(noticias, ({ one }) => ({
  autor: one(users, { fields: [noticias.autorId], references: [users.id] }),
}))

export const solicitudesRelations = relations(solicitudes, ({ one }) => ({
  programa: one(programas, { fields: [solicitudes.programaId], references: [programas.id] }),
}))
