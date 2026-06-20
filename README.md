# ESOFT Web — Escuela de Ingeniería de Software

> Sitio institucional y **plataforma de conocimiento** de la **Escuela de Ingeniería de Software (ESOFT)** de la **Universidad CENFOTEC**, Costa Rica — con **asesor de admisiones por IA (RAG)**.
>
> *SOMOS LO QUE SABEMOS.*

![Astro](https://img.shields.io/badge/Astro-6.x_SSR-BC52EE?logo=astro&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38BDF8?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5_22.12-339933?logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/DB-PostgreSQL_16_+_pgvector-4169E1?logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/IA-Gemini_(@google/genai)-8E75B2?logo=googlegemini&logoColor=white)
![Docker](https://img.shields.io/badge/Deploy-Docker_Compose-2496ED?logo=docker&logoColor=white)

---

## Tabla de contenidos

1. [Descripción general](#descripción-general)
2. [Stack tecnológico](#stack-tecnológico)
3. [Modelo académico](#modelo-académico)
4. [Inicio rápido](#inicio-rápido)
5. [Comandos](#comandos)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [Páginas y routing](#páginas-y-routing)
8. [Administración](#administración)
9. [IA — RAG y asesor](#ia--rag-y-asesor)
10. [API](#api)
11. [Base de datos](#base-de-datos)
12. [Design System — Libro de marca](#design-system--libro-de-marca)
13. [Deploy](#deploy)

---

## Descripción general

Aplicación web construida con **Astro 6 en modo SSR** (`output: 'server'`) — **no es un sitio estático**. El servidor renderiza en cada request, consulta PostgreSQL mediante Drizzle ORM y protege rutas y endpoints con autenticación JWT. Toda la oferta académica se sirve **dinámicamente desde la base de datos**.

Además del sitio institucional, el proyecto incluye:

- Un **panel de administración** para gestionar programas, su plan de estudios y los textos institucionales sin tocar código.
- Una capa de **IA (Google Gemini)**: cada programa se vectoriza en *chunks* con embeddings (pgvector), un **asesor de admisiones conversacional (RAG)** orienta a los prospectos, y una **ingesta por documento** extrae programas desde un Markdown y los carga como borradores.

**Características principales:**

- SSR con adapter Node.js standalone (entry point: `dist/server/entry.mjs`).
- Programas y rutas servidos dinámicamente desde PostgreSQL vía Drizzle ORM (`[slug].astro`).
- Navegación por **modalidades** (cuatrimestrales · microciclos) con fichas ricas por modalidad.
- Autenticación JWT con `jose`, cookie `esoft_session` (`HttpOnly`, `SameSite=Strict`).
- Panel admin (`/admin`) y perfil de docente (`/docentes/perfil`) protegidos por rol.
- **pgvector** + embeddings de Gemini para el corpus RAG; **asesor IA** en `/asesor`.
- **Ingesta por documento**: extracción estructurada + revisión por lotes en el admin.
- Bloques de contenido editables con **Markdown sanitizado**.
- Sistema visual alineado al **libro de marca CENFOTEC / ESOFT** (cobalt + magenta), tipografía Archivo + Inter.

---

## Stack tecnológico

| Tecnología | Versión | Propósito |
|:-----------|:--------|:----------|
| [Astro](https://astro.build) | 6.x | Framework **SSR** (`output: 'server'`) |
| [@astrojs/node](https://docs.astro.build/en/guides/integrations-guide/node/) | 10.x | Adapter Node.js en modo `standalone` |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | Utility-first vía `@tailwindcss/vite` (no usa `@astrojs/tailwind` v3) |
| [TypeScript](https://www.typescriptlang.org) | strict | Tipado estático **strict** (`astro/tsconfigs/strict`) |
| [PostgreSQL](https://www.postgresql.org) + [pgvector](https://github.com/pgvector/pgvector) | 16 | Base de datos relacional + tipo `vector` para embeddings |
| [Drizzle ORM](https://orm.drizzle.team) | 0.45 | ORM para PostgreSQL + migraciones (`drizzle-kit` 0.31) |
| [pg](https://node-postgres.com) | 8.x | Driver de PostgreSQL (`Pool`) |
| [jose](https://github.com/panva/jose) | 6.x | JWT para autenticación (cookie `esoft_session`) |
| [@google/genai](https://www.npmjs.com/package/@google/genai) | 2.x | SDK de Gemini (embeddings + generación estructurada) |
| [marked](https://marked.js.org) + [sanitize-html](https://github.com/apostrophecms/sanitize-html) | — | Render de Markdown sanitizado en bloques de contenido |
| [Docker Compose](https://docs.docker.com/compose/) | — | Servicios: `postgres` (pgvector), `app`, `pgadmin` |
| [Archivo](https://fonts.google.com/specimen/Archivo) / [Inter](https://fonts.google.com/specimen/Inter) | variable | Tipografía de **títulos** / **cuerpo** (vía `@fontsource-variable`) |
| Node.js | ≥ 22.12 | Entorno de ejecución |

**Modelos de IA** (en `src/lib/gemini.ts`): embeddings `gemini-embedding-001` con `outputDimensionality: 768`; generación `gemini-2.5-flash` con salida estructurada (`responseSchema`).

---

## Modelo académico

La oferta se organiza en **4 modalidades** (enum `modalidad_programa`), cada una con sus campos y su tipo de plan:

| Modalidad (`value`) | Etiqueta | Campos propios | Plan de estudios |
|:--------------------|:---------|:---------------|:-----------------|
| `cuatrimestral` | Cuatrimestral | nivel (`tecnico`/`bachillerato`/`maestria`), duración en cuatrimestres | **Cursos** por cuatrimestre con código, HL/HP/HE y créditos |
| `path` | Ruta de conocimiento | área, credencial, total de microciclos, horas, prerequisito | **Microciclos** en secuencia, con competencias |
| `curso_360` | Curso 360 | área, credencial, horas, prerequisito | **Módulos** (≈3), con competencias |
| `curso_continuo` | Curso continuo | área, credencial, horas | Sin unidades: **competencias** directas al programa |

Conceptos del schema:

- **Áreas curriculares** (`areas_curriculares`) — agrupan programas y rutas (Programación, Frontend, Backend, Bases de datos, Testing…).
- **Unidades** (`cursos`) — `tipo_unidad` ∈ `curso` · `microciclo` · `modulo_360`.
- **Competencias** (`competencias`) — con **SFIA** (`sfiaCodigo` + `sfiaNivel`) y `microcredencial`; ligadas a una unidad (`cursoId`) o al programa.
- **Nivel de credencial** (`nivel_credencial`) — `foundational` · `professional` · `advanced` · `expert`.
- **Rutas** (`rutas`) — colecciones curadas que vinculan varios programas (`programaIds`).
- **Bloques de contenido** (`bloques_contenido`) — textos institucionales editables (Markdown) por `clave`.
- **Chunks** (`chunks`) — fragmentos de texto de un programa con su `embedding vector(768)` para el RAG.

---

## Inicio rápido

### Requisitos previos

- Node.js ≥ 22.12 (`node -v`) y npm ≥ 10
- Docker + Docker Compose
- Una **API key de Google Gemini** (para embeddings y asesor) en `AI_API_KEY`

### Variables de entorno

Copiá `.env.example` a `.env` y completá los valores:

```bash
cp .env.example .env
```

```dotenv
POSTGRES_USER=esoft
POSTGRES_PASSWORD=cambia_esto_en_produccion
POSTGRES_DB=esoft_db

# La consume astro:env/server. Para comandos desde el HOST (migrate/seed/reset/studio)
# el contenedor expone el 5432 interno como 5433 en el host. Dentro de Docker,
# Compose inyecta DATABASE_URL=...@postgres:5432/... al servicio app.
DATABASE_URL=postgresql://esoft:cambia_esto_en_produccion@localhost:5433/esoft_db

SESSION_SECRET=cambia_esto_en_produccion   # mínimo 32 caracteres
PUBLIC_SITE_URL=https://esoft.ucenfotec.ac.cr
AI_API_KEY=tu_api_key_de_gemini
PGADMIN_EMAIL=admin@esoft.local
PGADMIN_PASSWORD=admin
```

- `DATABASE_URL` y `SESSION_SECRET` se validan vía `astro:env/server` y lanzan error al inicio si faltan.
- `AI_API_KEY` se lee de `process.env` (solo server-side, en `src/lib/gemini.ts`); si falta, la capa de IA falla con un mensaje claro y el resto del sitio sigue funcionando.

### Setup de un clon fresco

```bash
git clone https://github.com/soviedos/ESOFT_Web_Page.git
cd ESOFT_Web_Page
npm install

# 1) Levantar la base de datos (imagen pgvector/pgvector:pg16)
docker compose up -d postgres

# 2) Recrear el schema desde cero (aplica TODAS las migraciones, incl. pgvector + chunks)
npm run db:reset      # requiere el contenedor postgres arriba y DATABASE_URL en .env

# 3) Poblar la oferta académica de ejemplo
npm run db:seed

# 4) Vectorizar los programas para el RAG (requiere AI_API_KEY)
npm run ai:reindex

# 5) Servidor de desarrollo
npm run dev           # → http://localhost:4321
```

> `db:reset` ejecuta `psql` dentro del contenedor para dropear los schemas `public` **y** `drizzle`, y luego corre `db:migrate`. Necesita el contenedor `postgres` arriba y `DATABASE_URL` definida en `.env`.

El **primer usuario admin** se crea a mano (no hay UI de registro): ver [Base de datos](#base-de-datos).

---

## Comandos

| Comando | Descripción |
|:--------|:------------|
| `npm run dev` | Servidor de desarrollo en `localhost:4321` con HMR |
| `npm run build` | Build de producción SSR en `./dist/` |
| `npm run preview` | Sirve el build local para validación |
| `npm run check` | Verificación de tipos TypeScript (`astro check`) |
| `npm run db:generate` | Genera una migración a partir del schema |
| `npm run db:migrate` | Aplica las migraciones pendientes (requiere `DATABASE_URL`) |
| `npm run db:reset` | **Destructivo.** Dropea schemas `public` + `drizzle` y re-migra desde cero |
| `npm run db:seed` | Puebla áreas, programas (1 por modalidad), cursos, competencias, ruta y bloques |
| `npm run db:studio` | Abre Drizzle Studio para inspeccionar la BD |

**Scripts de IA** (cargan `.env` con `node --env-file`; requieren `AI_API_KEY`):

| Comando | Descripción |
|:--------|:------------|
| `npm run ai:test` | Verifica el cliente Gemini (genera un JSON y un embedding de 768 dims) |
| `npm run ai:reindex` | Vectoriza todos los programas activos (reconstruye los `chunks`) |
| `npm run ai:search "consulta"` | Smoke test de recuperación: top-3 chunks por distancia coseno |
| `npm run ai:asesor "consulta"` | Prueba el asesor RAG end-to-end (recuperación + generación) |
| `npm run ai:extraer <archivo.md>` | Extrae programas de un documento e imprime un resumen |
| `npm run ai:importar <archivo.md>` | Extrae y persiste los programas como borrador con su plan |

**Docker Compose:**

```bash
docker compose up -d                  # postgres + app
docker compose --profile dev up -d    # + pgadmin en :5050
docker compose up -d --build app      # reconstruir la imagen de la app tras cambios
docker compose watch app              # rebuild automático al detectar cambios en src/, public/, config
docker compose down                   # detener
```

---

## Estructura del proyecto

```
ESOFT_Web_Page/
├── public/                          # Assets estáticos (logos, sellos, favicon)
├── fixtures/
│   └── ejemplo-ingesta.md           # Documento de ejemplo para la ingesta
├── scripts/                         # CLIs de IA / verificación (tsx)
│   ├── ai-test.ts · ai-reindex.ts · ai-search.ts
│   └── ai-asesor.ts · ai-extraer.ts · ai-importar.ts
│
├── src/
│   ├── components/
│   │   ├── Nav.astro · Footer.astro · Card.astro · RichText.astro
│   │   ├── Terminal.astro · ParticleGrid.astro
│   │   ├── ui/          # Átomos: CTAButton, Breadcrumb, SectionBadge, BulletItem, StatCard, TechBadge
│   │   ├── sections/    # ProgramaHero, InfoCTA, TechGrid, RutaLayout, ModalidadListing
│   │   ├── programa/    # Layouts por modalidad: ProgramaCuatrimestral, ProgramaModular,
│   │   │                #   ProgramaContinuo + CurriculumTabla, UnidadSecuencia, CompetenciaItem
│   │   ├── admin/       # ProgramaForm, PlanEditor, UnidadRow, CompetenciaRow
│   │   └── asesor/      # ChatAsesor (UI del chat RAG)
│   │
│   ├── layouts/
│   │   ├── Base.astro               # Shell HTML público (Nav, Footer, partículas, fuentes)
│   │   └── Admin.astro              # Shell del panel de administración
│   │
│   ├── pages/                       # Rutas SSR (ver Páginas y routing)
│   │   ├── index.astro · contacto.astro · login.astro · asesor.astro
│   │   ├── programas/ · rutas/ · escuela/ · historias/ · admision/ · blog/ · landing/
│   │   ├── admin/                   # Panel admin (programas, contenido, ingesta)
│   │   ├── docentes/                # perfil
│   │   └── api/                     # Endpoints SSR (ver API)
│   │
│   ├── db/
│   │   ├── schema.ts                # Tablas y enums Drizzle
│   │   ├── client.ts                # Pool pg + drizzle (astro:env en SSR, process.env en scripts)
│   │   └── seed.ts                  # Seed de áreas, programas, cursos, competencias, ruta, bloques
│   │
│   ├── lib/
│   │   ├── auth.ts · password.ts    # JWT (jose) + hashing de contraseñas
│   │   ├── modalidades.ts           # Config por modalidad (campos, plan) + parse de formularios
│   │   ├── programa-write.ts        # Único camino de escritura: crear/actualizar + plan + vectorizar
│   │   ├── gemini.ts                # Cliente Gemini: generarEmbedding / generarJSON
│   │   ├── embeddings.ts            # chunkPrograma / vectorizarPrograma (corpus RAG)
│   │   ├── asesor.ts                # responderAsesor (recuperación coseno + generación)
│   │   ├── ingesta.ts               # extraerProgramas / resolverPrograma / mapearYPersistir
│   │   ├── contenido.ts · markdown.ts  # Bloques de contenido + Markdown sanitizado
│   │   ├── labels.ts · types.ts · utils.ts
│   │
│   ├── middleware.ts                # Cabeceras de seguridad
│   └── styles/global.css            # Design system: @theme + componentes + efectos
│
├── db/migrations/                   # Migraciones drizzle-kit (incl. pgvector y chunks)
├── astro.config.mjs · drizzle.config.ts
├── docker-compose.yml · Dockerfile
└── package.json · tsconfig.json · .env.example
```

---

## Páginas y routing

Routing de archivos de Astro en modo SSR. Las páginas de contenido son `.astro`; los **programas y rutas se sirven dinámicamente desde la base de datos**.

### Contenido dinámico (desde PostgreSQL)

- `programas/[slug].astro` — consulta el programa por slug (con cursos, competencias, área, prerequisito) y renderiza el layout según su **modalidad**: `ProgramaCuatrimestral` (tabla de cursos por cuatrimestre), `ProgramaModular` (path / curso 360, secuencia de unidades con competencias) o `ProgramaContinuo` (competencias directas).
- `rutas/[slug].astro` — ruta por slug con sus programas asociados.

> **Nota de routing:** Astro prioriza una ruta estática sobre `[slug].astro`. No deben crearse `.astro` con el mismo slug que un programa/ruta en esos directorios.

### Navegación pública

| Sección | Rutas |
|:--------|:------|
| Inicio · Contacto · Acceso | `/` · `/contacto` · `/login` |
| **Asesor IA** | `/asesor` (chat RAG) |
| **Programas (hub)** | `/programas` · `/programas/cuatrimestrales` (filtro por nivel) |
| Microciclos | `/programas/microciclos` · `/microciclos/rutas` · `/microciclos/cursos-360` · `/microciclos/cursos-continuos` |
| Ficha de programa | `/programas/[slug]` (dinámico) |
| Rutas | `/rutas` · `/rutas/[slug]` (dinámico) |
| Escuela | `/escuela`, `/escuela/director`, `/escuela/docentes`, `/escuela/metodologia` |
| Historias | `/historias`, `/historias/docentes`, `/historias/egresados`, `/historias/estudiantes` |
| Admisión | `/admision`, `/admision/proceso`, `/admision/requisitos`, `/admision/financiamiento`, `/admision/solicitar-informacion` |
| Blog · Landings | `/blog` · `/landing/{bachillerato-software, maestria-ia, ruta-testing, ux-ui-agil}` |

El menú principal es: **Programas ▾** (Cuatrimestrales · Microciclos) · **Escuela ▾** · Admisión · Historias · **Asesor IA** · Acceso · *Solicitar información* (CTA).

### Área autenticada

| Ruta | Acceso | Descripción |
|:-----|:-------|:------------|
| `/admin` | Rol `admin` | Panel de administración |
| `/admin/programas` | Rol `admin` | Listado y gestión (`/nuevo`, `/[id]`, `/[id]/plan`, `/importar`) |
| `/admin/contenido` | Rol `admin` | Bloques de contenido editables (`/[id]`) |
| `/docentes/perfil` | Autenticado | Perfil editable del docente |

---

## Administración

Todo el alta/edición pasa por el **camino server-side del admin** (`src/lib/programa-write.ts`), no por la API REST.

- **Crear programa** (`/admin/programas/nuevo`): primero se elige la **modalidad**; el formulario muestra solo los campos que aplican. La modalidad es **inmutable** en edición.
- **Editor de plan** (`/admin/programas/[id]/plan`): unidades + competencias según la modalidad (cursos con HL/HP/HE, microciclos, módulos, o competencias directas). Persistencia atómica.
- **Vectorización automática:** tras crear/editar un programa o guardar su plan se reconstruyen sus `chunks` (best-effort; si Gemini falla, el guardado no se bloquea).
- **Contenido** (`/admin/contenido`): edición de los textos institucionales (Markdown) que consumen las landings y la página de metodología.
- **Ingesta por documento** (`/admin/programas/importar`): pegás/subís un Markdown multi-programa → la IA lo **extrae** → revisás por lotes (título y área editables, warnings de resolución, incluir/excluir) → se importan como **borradores** con su plan y sus chunks.

---

## IA — RAG y asesor

La capa de IA es **solo server-side** (la `AI_API_KEY` nunca llega al navegador).

1. **Embeddings y chunks** (`src/lib/embeddings.ts`): cada programa se descompone en chunks de texto (resumen, una por unidad, una por competencia) y se embebe con `gemini-embedding-001` (768 dims). Se guardan en `chunks.embedding` (`vector(768)`), con un índice **HNSW** (`vector_cosine_ops`).
2. **Asesor RAG** (`src/lib/asesor.ts` + `POST /api/asesor`): embebe el mensaje del prospecto, recupera los chunks más cercanos por **distancia coseno**, arma el prompt (persona + guardarraíles + contexto) y genera una respuesta estructurada con `gemini-2.5-flash`. Solo cita programas presentes en el contexto. Endpoint público con **rate-limit por IP** (15 req/min, en memoria). UI de chat en `/asesor`.
3. **Ingesta por documento** (`src/lib/ingesta.ts`): `extraerProgramas` (salida estructurada), `resolverPrograma` (valida enums, resuelve área/prerequisito contra la BD) y `mapearYPersistir` (crea borrador + plan).

---

## API

Endpoints en `src/pages/api/` (SSR):

| Método | Endpoint | Acceso | Descripción |
|:-------|:---------|:-------|:------------|
| `POST` | `/api/auth/login` | Público | Valida credenciales y emite la cookie `esoft_session` |
| `POST` | `/api/auth/logout` | Público | Limpia la cookie de sesión (`Max-Age=0`) |
| `GET` | `/api/programas` | Público | Devuelve los programas activos (solo lectura) |
| `POST` | `/api/asesor` | Público (rate-limit) | Asesor RAG: recibe `{ mensaje, historial? }`, responde `{ respuesta, programas[], tipoRecomendacion }` |
| `GET` | `/api/docentes/[id]` | Autenticado | Devuelve un docente por id |
| `PATCH` | `/api/docentes/[id]` | Autenticado | Actualiza el perfil de un docente |

> **`/api/solicitud` no existe a propósito.** El formulario de admisión (`/admision/solicitar-informacion`) está pendiente de conectarse al CRM universitario.

---

## Base de datos

PostgreSQL 16 con **pgvector**, gestionado con Drizzle ORM. El schema (`src/db/schema.ts`) define:

- **Tablas:** `areas_curriculares`, `users`, `docentes`, `programas`, `cursos`, `competencias`, `chunks`, `rutas`, `bloques_contenido`, `noticias`, `solicitudes`.
- **Enums:** `rol` (`admin`, `docente`), `modalidad_programa` (`cuatrimestral`, `path`, `curso_360`, `curso_continuo`), `nivel_programa` (`tecnico`, `bachillerato`, `maestria`), `tipo_unidad` (`curso`, `microciclo`, `modulo_360`), `nivel_credencial` (`foundational`, `professional`, `advanced`, `expert`).

**Convención Drizzle:** las propiedades TypeScript son **camelCase** aunque la columna en DB sea snake_case (p. ej. `perfilEgresado: text('perfil_egresado')`).

**Migraciones** (`db/migrations/`): se generan con `npm run db:generate` y se aplican **desde el host** (puerto 5433). La extensión pgvector y la tabla `chunks` (con índice HNSW) viven en las migraciones `0003`–`0004`.

```bash
DATABASE_URL=postgresql://esoft:PASSWORD@localhost:5433/esoft_db npm run db:migrate
```

**Seed** (`src/db/seed.ts`): inserta 1 usuario admin, áreas curriculares, **un programa por modalidad** con su plan (cursos / microciclos / módulos / competencias), una ruta transversal y los bloques de contenido. **Borra y reinserta** el contenido académico; no toca solicitudes ni noticias. Tras el seed, corré `npm run ai:reindex` para poblar los `chunks`.

**Primer usuario admin** (no hay UI de registro): crealo en la tabla `users` (rol `admin`) vía Drizzle Studio (`npm run db:studio`) o un script que use `hashPassword` de `src/lib/password.ts`.

---

## Design System — Libro de marca

Sistema visual alineado al **libro de marca CENFOTEC / ESOFT**. Los tokens viven en el bloque `@theme {}` de `src/styles/global.css`. El sitio es **light mode** sobre fondo off-white.

### Paleta oficial

| Rol | Hex | Token `@theme` | Uso |
|:----|:----|:---------------|:----|
| Azul cobalt primario | `#164A98` | `--color-brand` | Color base; domina la estructura |
| Azul brillante | `#006AEA` | `--color-brand-hover` / `--color-accent3` | Interacción, hover, enlaces, datos |
| Azul claro | `#9CC8FF` | `--color-brand-soft` | Fondos y tintes suaves |
| Magenta de la Escuela | `#C81F66` | `--color-accent2` | **Solo** acciones y acentos puntuales (CTAs) |
| Magenta oscuro | `#A81857` | `--color-accent-hover` | Hover de CTAs |
| Off-white | `#F8F9FC` | `--color-bg-primary` | Fondo base |

> Para efectos con transparencia se usa el triplete `--color-brand-rgb: 22 74 152` con `rgb(var(--color-brand-rgb) / α)`.

### Reglas de marca

- **El cobalt y los azules dominan.** El magenta **nunca** se usa como fondo grande: se reserva para CTAs ("Solicitar información"), badges activos y **1–2 acentos por pantalla**.
- **Prohibido el naranja** (`#F97316` / `orange-*`) y el **púrpura**: no están en el libro de marca.
- **Nunca** valores hex directos en clases (`bg-[#a01855]`): usar el token (`bg-accent-hover`). **Nunca** `pt-[72px]`: usar `pt-[var(--nav-height)]`.
- **Títulos:** **Archivo** (variable, token `--font-display`) — geométrica tipo DIN, sustituto del DIN Alternate Bold. **Cuerpo:** **Inter** (token `--font-sans`).
- **Eslogan institucional:** *SOMOS LO QUE SABEMOS.*

### Componentes y efectos CSS de referencia

`.card-premium` · `.card-feature` · `.card-stat` · `.btn-primary` (CTA magenta) · `.btn-ghost` · `.headline-display` · `.text-gradient-hero` · `.hero-grid` · `.aurora-orb` · `.ambient-glow` · `.light-sweep` · `.reveal` / `.reveal-stagger` · `.section-divider` · `.hr-gradient`.

---

## Deploy

Despliegue vía **Docker Compose**. El `Dockerfile` es multi-stage (`deps → prod-deps → builder → runtime`): construye el sitio SSR y la imagen final ejecuta `node ./dist/server/entry.mjs`.

### Servicios (`docker-compose.yml`)

| Servicio | Imagen | Puerto host → contenedor | Notas |
|:---------|:-------|:-------------------------|:------|
| `postgres` | `pgvector/pgvector:pg16` | `5433 → 5432` | PostgreSQL 16 con pgvector; volumen `postgres_data`, healthcheck |
| `app` | build local | `4321 → 4321` | `NODE_ENV=production`, depende de `postgres` healthy |
| `pgadmin` | `dpage/pgadmin4` | `5050 → 80` | Solo con `--profile dev` |

### Puesta en marcha

```bash
cp .env.example .env                  # configurar (ver Inicio rápido)
docker compose up -d                  # postgres + app

# Migrar + seed + vectorizar desde el host (puerto 5433)
DATABASE_URL=postgresql://esoft:PASSWORD@localhost:5433/esoft_db npm run db:migrate
DATABASE_URL=postgresql://esoft:PASSWORD@localhost:5433/esoft_db npm run db:seed
npm run ai:reindex                    # requiere AI_API_KEY

docker compose --profile dev up -d    # (opcional) pgAdmin en http://localhost:5050
```

La app queda en `http://localhost:4321`. Para reflejar cambios de código en el contenedor: `docker compose up -d --build app` o `docker compose watch app`.

---

## Licencia

Uso interno — Universidad CENFOTEC / ESOFT. Todos los derechos reservados.
