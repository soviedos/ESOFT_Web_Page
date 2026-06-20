# CLAUDE.md — Contexto del proyecto ESOFT Web

## Propósito
Sitio institucional y **plataforma de conocimiento** de la Escuela de Ingeniería del Software (ESOFT) de la Universidad CENFOTEC, Costa Rica. Sirve la oferta académica desde la BD, tiene un panel admin para gestionar contenido sin tocar código, y una capa de **IA (Gemini)**: vectorización de programas (pgvector), un **asesor de admisiones RAG** y una **ingesta de programas por documento**.

## Stack

- **Astro 6.x** — modo `output: 'server'` (SSR). No es estático. No usar `@astrojs/tailwind` (es v3); usar `@tailwindcss/vite`.
- **@astrojs/node** — adapter standalone. Entry point en producción: `dist/server/entry.mjs`.
- **Tailwind CSS v4** — design tokens en `src/styles/global.css` bajo `@theme {}`.
- **Drizzle ORM + PostgreSQL 16 + pgvector** — cliente en `src/db/client.ts`, schema en `src/db/schema.ts`. La imagen de Docker es `pgvector/pgvector:pg16`.
- **JWT con `jose`** — cookie `esoft_session`. Auth en `src/lib/auth.ts`.
- **IA: `@google/genai` (Gemini)** — cliente en `src/lib/gemini.ts`. Embeddings `gemini-embedding-001` (768 dims), generación `gemini-2.5-flash`. **Solo server-side**; la `AI_API_KEY` nunca llega al navegador.
- **Markdown:** `marked` + `sanitize-html` para los bloques de contenido (`src/lib/markdown.ts`).
- **Docker Compose** — postgres (puerto host 5433, interno 5432), app (4321), pgadmin (5050, profile dev).

## Convenciones críticas

### Drizzle schema
- Los nombres de propiedades TypeScript son **camelCase** aunque el column en DB sea snake_case. Ejemplo correcto: `perfilEgresado: text('perfil_egresado')`.
- Enums en `schema.ts`: `modalidadPrograma` (`cuatrimestral`, `path`, `curso_360`, `curso_continuo`), `nivelPrograma` (`tecnico`, `bachillerato`, `maestria`), `tipoUnidad` (`curso`, `microciclo`, `modulo_360`), `nivelCredencial` (`foundational`, `professional`, `advanced`, `expert`), `rol`.
- Tablas: `areasCurriculares`, `users`, `docentes`, `programas`, `cursos`, `competencias`, `chunks`, `rutas`, `bloquesContenido`, `noticias`, `solicitudes`.
- **`chunks`** tiene `embedding vector(768)` (columna pgvector) con índice **HNSW** (`vector_cosine_ops`). Drizzle: `vector('embedding', { dimensions: 768 })`.

### Migraciones
- Se generan con `npm run db:generate`; archivos en `db/migrations/` (raíz del proyecto, no en `src/`).
- Se aplican **desde el host**, no desde el contenedor: `DATABASE_URL=postgresql://esoft:PASS@localhost:5433/esoft_db npm run db:migrate`.
- pgvector y la tabla `chunks` se habilitan en las migraciones `0003`–`0004`.
- **Reset completo (`npm run db:reset`):** dropea **dos** schemas, no solo `public`. Drizzle guarda su tabla de tracking `__drizzle_migrations` en un schema aparte `drizzle`; si solo dropeás `public`, el tracking sobrevive y la siguiente `db:migrate` falla. Por eso el reset hace `DROP SCHEMA public CASCADE; CREATE SCHEMA public; DROP SCHEMA IF EXISTS drizzle CASCADE;` y re-aplica todas las migraciones. Corre `psql` dentro del contenedor (necesita postgres arriba) y luego `db:migrate` (necesita `DATABASE_URL` en `.env`). **Destructivo.**

### db/client.ts — doble entorno
`DATABASE_URL` se resuelve vía `astro:env/server` en SSR/dev y cae a `process.env.DATABASE_URL` en scripts ejecutados con `tsx` (donde `astro:env` no existe). Esto permite que `db:seed`, `ai:reindex`, etc. compartan el mismo cliente.

### Routing — programas y rutas 100% dinámicos
- Programas y rutas se sirven **dinámicamente desde la BD** vía `[slug].astro`. `programas/[slug].astro` elige el layout según la **modalidad**: `ProgramaCuatrimestral`, `ProgramaModular` (path / curso 360) o `ProgramaContinuo`.
- El hub de programas es `/programas` → `/programas/cuatrimestrales` (filtro por nivel) y `/programas/microciclos` → `rutas` / `cursos-360` / `cursos-continuos`.
- Salvedad: Astro prioriza rutas estáticas sobre `[slug].astro`. No crear `.astro` con el mismo slug que un programa/ruta en esos directorios.

### Escritura de programas — único camino
Todo el alta/edición pasa por `src/lib/programa-write.ts` (no por la API REST): `crearPrograma`, `actualizarPrograma`, `guardarPlan` (plan atómico), `guardarBloque`. Tras crear/editar un programa o guardar su plan se **revectoriza best-effort** (`vectorizarPrograma`): si Gemini falla, se loguea y el guardado no se bloquea.

### Variables de entorno
```
DATABASE_URL=postgresql://esoft:PASSWORD@localhost:5433/esoft_db  # desde host
DATABASE_URL=postgresql://esoft:PASSWORD@postgres:5432/esoft_db   # desde container (lo inyecta Compose)
SESSION_SECRET=string-seguro-minimo-32-chars
PUBLIC_SITE_URL=https://esoft.ucenfotec.ac.cr
AI_API_KEY=...        # Google Gemini
```
- `DATABASE_URL` y `SESSION_SECRET` se validan vía `astro:env/server` (esquema en `astro.config.mjs`, `context: 'server', access: 'secret'`); lanzan `Error` al inicio si faltan.
- `AI_API_KEY` **no** está en el esquema de `astro:env`: se lee de `process.env` en `src/lib/gemini.ts` (init perezoso con guard claro si falta).

### CSS
- Nunca usar `bg-[#a01855]` directo — usar `bg-accent-hover` (token en `@theme`).
- Nunca usar `pt-[72px]` directo — usar `pt-[var(--nav-height)]`.
- `--color-brand` = `#164A98` (cobalt CENFOTEC). `--color-accent2` = `#C81F66` (magenta ESOFT, para CTAs).

## Sistema visual — Libro de marca CENFOTEC / ESOFT

Reglas oficiales del libro de marca. **Deben respetarse en todo cambio visual.**

### Paleta oficial
| Rol | Hex | Uso |
|-----|-----|-----|
| Azul cobalt primario | `#164A98` | Color base; domina la estructura |
| Azul brillante | `#006AEA` | Interacción / hover / enlaces |
| Azul claro | `#9CC8FF` | Fondos y tintes suaves |
| Magenta de la Escuela | `#C81F66` | SOLO acciones y acentos puntuales |
| Magenta oscuro | `#A81857` | Hover de CTAs |
| Neutro oscuro | `#7C7B75` | Texto secundario, bordes |
| Neutro claro | `#D2D2D2` | Separadores, deshabilitado |
| Off-white | `#F8F9FC` | Fondo base |

### Reglas de uso
- El **cobalt y los azules dominan**. El magenta **nunca** se usa como fondo grande; se reserva para CTAs ("Solicitar información"), badges activos y **1–2 acentos por pantalla**.
- **PROHIBIDO el naranja** (`#F97316` y cualquier `orange-*`) y el **púrpura**.
- **Títulos:** **Archivo** (sustituto web del DIN Alternate Bold). **Cuerpo:** **Inter**.
- **Eslogan:** "SOMOS LO QUE SABEMOS".

## Estructura de componentes
```
src/components/
  ui/        — átomos: CTAButton, Breadcrumb, SectionBadge, BulletItem, StatCard, TechBadge
  sections/  — ProgramaHero, InfoCTA, TechGrid, RutaLayout, ModalidadListing
  programa/  — layouts por modalidad: ProgramaCuatrimestral, ProgramaModular, ProgramaContinuo
               + CurriculumTabla, UnidadSecuencia, CompetenciaItem
  admin/     — ProgramaForm, PlanEditor, UnidadRow, CompetenciaRow
  asesor/    — ChatAsesor (UI del chat RAG)
  (raíz)     — Nav, Footer, Card, RichText, Terminal, ParticleGrid
```

## Capa de IA (`src/lib/`)
- **`gemini.ts`** — `generarEmbedding(texto)` (768 dims, retry ante rate limit) y `generarJSON(prompt, schema)` (salida estructurada).
- **`embeddings.ts`** — `chunkPrograma` arma los chunks (resumen + por unidad + por competencia); `vectorizarPrograma(id)` los embebe y reemplaza en una transacción.
- **`asesor.ts`** — `responderAsesor(mensaje, historial?)`: recupera por distancia coseno (`chunks.embedding`), arma el prompt (persona + guardarraíles + contexto) y genera `{ respuesta, programas[], tipoRecomendacion }`. Expuesto en `POST /api/asesor` (público, rate-limit 15/min por IP, en memoria). UI en `/asesor`.
- **`ingesta.ts`** — `extraerProgramas(markdown)` (extracción estructurada), `resolverPrograma` (valida enums, resuelve área/prerequisito) y `mapearYPersistir` (crea borrador + plan). UI de revisión por lotes en `/admin/programas/importar`.

## Base de datos: setup y seed

**Clon fresco:** `docker compose up -d postgres` → `npm run db:reset` → `npm run db:seed` → `npm run ai:reindex` (este último requiere `AI_API_KEY`).

El seed (`src/db/seed.ts`) inserta: 1 usuario admin, áreas curriculares, **un programa por modalidad** con su plan (cursos / microciclos / módulos / competencias), una ruta transversal y los bloques de contenido. **Borra y reinserta** el contenido académico; no toca solicitudes ni noticias. Tras el seed hay que correr `ai:reindex` para poblar los `chunks`.

**Primer usuario admin** (no hay UI de registro): crealo en la tabla `users` (rol `admin`) vía `npm run db:studio` o un script con `hashPassword` de `src/lib/password.ts`.

## Comandos frecuentes
```bash
npm run dev          # servidor de desarrollo
npm run build        # build de producción
npm run check        # verificación de tipos TypeScript
npm run db:generate  # generar migración desde schema
npm run db:migrate   # aplicar migraciones (requiere DATABASE_URL)
npm run db:reset     # reset destructivo (dos schemas) + re-migrar
npm run db:seed      # poblar contenido académico
npm run db:studio    # UI de Drizzle Studio

# IA (cargan .env; requieren AI_API_KEY)
npm run ai:test      # verifica el cliente Gemini (JSON + embedding 768)
npm run ai:reindex   # vectoriza todos los programas activos
npm run ai:search    # smoke test de recuperación (coseno)
npm run ai:asesor    # prueba el asesor RAG end-to-end
npm run ai:extraer   # extrae programas de un .md (sin persistir)
npm run ai:importar  # extrae y persiste como borrador

docker compose up -d                  # postgres + app
docker compose --profile dev up -d    # + pgadmin en :5050
```

## Estado del proyecto

### Implementado
- **Modelo académico:** 4 modalidades (cuatrimestral, path, curso 360, curso continuo) con áreas, competencias/SFIA, credenciales y rutas-colección. Fichas dinámicas por modalidad.
- **Autenticación:** login en `/login` → `/api/auth/login` · `/api/auth/logout`. JWT con `jose` (cookie `esoft_session`, `HttpOnly`, `SameSite=Strict`).
- **Panel admin:** `/admin/programas` (selector de modalidad en `nuevo`, edición en `[id]`, editor de plan en `[id]/plan`, ingesta en `importar`) y `/admin/contenido` (bloques editables en Markdown). El alta/edición pasa por `src/lib/programa-write.ts`. `GET /api/programas` es API pública de solo lectura.
- **IA / RAG:** pgvector + embeddings de Gemini; corpus de `chunks` reconstruido al guardar y vía `ai:reindex`. **Asesor de admisiones** en `/asesor` (`POST /api/asesor`, rate-limited). **Ingesta por documento** con revisión por lotes.
- **Perfil de docente self-service:** `/docentes/perfil`; `GET`/`PATCH /api/docentes/[id]` requieren autenticación.
- **Despliegue:** Docker Compose (postgres con pgvector, app, pgadmin).

### Pendiente
- **Formulario de admisión → CRM:** `/admision/solicitar-informacion` aún no conecta al CRM; `/api/solicitud` no existe intencionalmente.
- **Endurecimiento de auth:** rate limiting de login, expiración/refresh, protección de rutas más allá del check de JWT.
- **Asesor multi-turno:** la recuperación usa solo el mensaje actual (sin reescritura de la query con el historial); el historial sí se pasa a la generación.
- **Rate-limit del asesor:** es en memoria (una sola instancia); multi-instancia requeriría un store compartido.
