# ESOFT Web — Escuela de Ingeniería de Software

> Sitio web institucional de la **Escuela de Ingeniería de Software (ESOFT)** de la **Universidad CENFOTEC**, Costa Rica.
>
> *SOMOS LO QUE SABEMOS.*

![Astro](https://img.shields.io/badge/Astro-6.x_SSR-BC52EE?logo=astro&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38BDF8?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9_strict-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5_22.12-339933?logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/DB-PostgreSQL_16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Deploy-Docker_Compose-2496ED?logo=docker&logoColor=white)

---

## Tabla de contenidos

1. [Descripción general](#descripción-general)
2. [Stack tecnológico](#stack-tecnológico)
3. [Inicio rápido](#inicio-rápido)
4. [Comandos](#comandos)
5. [Estructura del proyecto](#estructura-del-proyecto)
6. [Páginas y routing](#páginas-y-routing)
7. [API](#api)
8. [Base de datos](#base-de-datos)
9. [Design System — Libro de marca](#design-system--libro-de-marca)
10. [Deploy](#deploy)

---

## Descripción general

Aplicación web institucional construida con **Astro 6 en modo SSR** (`output: 'server'`), **no es un sitio estático**. El servidor renderiza en cada request, consulta una base de datos PostgreSQL mediante Drizzle ORM y protege rutas y endpoints con autenticación JWT. Todo el entorno (app, base de datos y administración de BD) se levanta con Docker Compose.

Presenta la oferta académica de ESOFT — maestrías, bachillerato, técnicos y rutas de aprendizaje — servida **dinámicamente desde la base de datos**, además de un panel de administración para gestionar contenido sin tocar código y perfiles editables de docentes.

**Características principales:**

- SSR con adapter Node.js standalone (entry point: `dist/server/entry.mjs`).
- Programas y rutas servidos dinámicamente desde PostgreSQL vía Drizzle ORM (`[slug].astro`).
- Autenticación JWT con `jose`, cookie `esoft_session` (`HttpOnly`, `SameSite=Strict`).
- Panel admin (`/admin`) y perfil de docente (`/docentes/perfil`) protegidos por rol.
- Cabeceras de seguridad globales vía middleware (CSP, HSTS, X-Frame-Options, etc.).
- Sistema visual alineado al **libro de marca CENFOTEC / ESOFT** (cobalt + magenta), tipografía Archivo + Inter.
- Sistema de partículas interactivas (canvas) y terminal animada en el landing.

---

## Stack tecnológico

| Tecnología | Versión | Propósito |
|:-----------|:--------|:----------|
| [Astro](https://astro.build) | 6.x | Framework **SSR** (`output: 'server'`) |
| [@astrojs/node](https://docs.astro.build/en/guides/integrations-guide/node/) | 10.x | Adapter Node.js en modo `standalone` |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | Utility-first vía `@tailwindcss/vite` (no usa `@astrojs/tailwind` v3) |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Tipado estático **strict** (`astro/tsconfigs/strict`) |
| [Drizzle ORM](https://orm.drizzle.team) | 0.45 | ORM para PostgreSQL + migraciones (`drizzle-kit`) |
| [PostgreSQL](https://www.postgresql.org) | 16 | Base de datos relacional |
| [jose](https://github.com/panva/jose) | 6.x | JWT para autenticación (cookie `esoft_session`) |
| [pg](https://node-postgres.com) | 8.x | Driver de PostgreSQL (`Pool`) |
| [Docker Compose](https://docs.docker.com/compose/) | — | Servicios: `app`, `postgres`, `pgadmin` |
| [Archivo](https://fonts.google.com/specimen/Archivo) | variable | Tipografía de **títulos** (sustituto web del DIN Alternate Bold) |
| [Inter](https://fonts.google.com/specimen/Inter) | variable | Tipografía de **cuerpo** |
| Node.js | ≥ 22.12 | Entorno de ejecución |

Las fuentes se cargan localmente vía `@fontsource-variable/archivo` y `@fontsource-variable/inter` (importadas en `src/layouts/Base.astro`).

---

## Inicio rápido

### Requisitos previos

- Node.js ≥ 22.12 (`node -v`)
- npm ≥ 10 (`npm -v`)
- Docker + Docker Compose (para la base de datos y el entorno completo)

### Variables de entorno

Copiá `.env.example` a `.env` y completá los valores:

```bash
cp .env.example .env
```

```dotenv
POSTGRES_USER=esoft
POSTGRES_PASSWORD=cambia_esto_en_produccion
POSTGRES_DB=esoft_db
SESSION_SECRET=cambia_esto_en_produccion   # mínimo 32 caracteres
PUBLIC_SITE_URL=https://esoft.ucenfotec.ac.cr
AI_API_KEY=
PGADMIN_EMAIL=admin@esoft.local
PGADMIN_PASSWORD=admin
```

`DATABASE_URL` y `SESSION_SECRET` se validan vía `astro:env/server` y lanzan error al inicio si faltan. La forma de `DATABASE_URL` depende del contexto:

```bash
# desde el host (migraciones, seed, studio)
DATABASE_URL=postgresql://esoft:PASSWORD@localhost:5433/esoft_db

# desde el contenedor app (la define docker-compose.yml)
DATABASE_URL=postgresql://esoft:PASSWORD@postgres:5432/esoft_db
```

### Desarrollo local

```bash
git clone https://github.com/soviedos/ESOFT_Web_Page.git
cd ESOFT_Web_Page
npm install

# Levantar solo la base de datos con Docker
docker compose up -d postgres

# Aplicar migraciones y poblar datos (desde el host, puerto 5433)
DATABASE_URL=postgresql://esoft:PASSWORD@localhost:5433/esoft_db npm run db:migrate
DATABASE_URL=postgresql://esoft:PASSWORD@localhost:5433/esoft_db npm run db:seed

# Servidor de desarrollo
npm run dev
# → http://localhost:4321
```

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
| `npm run db:seed` | Puebla programas, cursos y rutas (requiere `DATABASE_URL`) |
| `npm run db:studio` | Abre Drizzle Studio para inspeccionar la BD |

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
│   ├── ESOFT_Software-Engineering-Azul.png / -Negro.png
│   ├── UCENFOTEC_LogoHorizontal-Azul.png / -Negro.png / Vertical-*
│   ├── Logo_SINAES.jpg
│   ├── Sello Oficial-01.png
│   └── favicon.svg / favicon.ico
│
├── src/
│   ├── components/
│   │   ├── Nav.astro · Footer.astro · Card.astro
│   │   ├── Terminal.astro · ParticleGrid.astro
│   │   ├── ui/                      # Átomos: CTAButton, Breadcrumb, SectionBadge,
│   │   │                            #   BulletItem, StatCard, TechBadge
│   │   ├── sections/                # Moléculas: ProgramaHero, CurriculumSection,
│   │   │                            #   InfoCTA, TechGrid, RutaLayout
│   │   └── programa/                # ProgramaLayout (motor) + variantes:
│   │                                #   Bachillerato, Maestria, Tecnico, Corporativo
│   │
│   ├── layouts/
│   │   ├── Base.astro               # Shell HTML global (Nav, Footer, partículas, fuentes)
│   │   └── Admin.astro              # Shell del panel de administración
│   │
│   ├── pages/                       # Rutas (SSR)
│   │   ├── index.astro · contacto.astro · login.astro
│   │   ├── admision/                # index, proceso, requisitos, financiamiento,
│   │   │                            #   solicitar-informacion
│   │   ├── escuela/                 # index, director, docentes, metodologia
│   │   ├── historias/               # index, docentes, egresados, estudiantes
│   │   ├── industria-empleabilidad/ # index, alianzas, certificaciones, empleabilidad
│   │   ├── blog/                    # index
│   │   ├── landing/                 # bachillerato-software, maestria-ia,
│   │   │                            #   ruta-testing, ux-ui-agil
│   │   ├── programas/               # index + [slug].astro (dinámico desde BD)
│   │   ├── rutas/                   # index + [slug].astro (dinámico desde BD)
│   │   ├── admin/                   # index + programas/{index, nuevo, [id]}
│   │   ├── docentes/                # perfil
│   │   └── api/                     # Endpoints — ver sección API
│   │
│   ├── db/
│   │   ├── schema.ts                # Tablas y enums Drizzle
│   │   ├── client.ts                # Pool pg + instancia drizzle
│   │   └── seed.ts                  # Seed de programas, cursos y rutas
│   │
│   ├── lib/
│   │   ├── auth.ts                  # JWT (jose): signToken / requireAuth
│   │   ├── password.ts              # Hash y verificación de contraseñas
│   │   ├── utils.ts                 # Utilidades (slugify, etc.)
│   │   └── types.ts                 # Tipos compartidos
│   │
│   ├── middleware.ts                # Cabeceras de seguridad (CSP, HSTS, …)
│   └── styles/
│       └── global.css              # Design system: @theme + componentes + efectos
│
├── db/migrations/                   # Migraciones generadas por drizzle-kit
├── astro.config.mjs                 # Config Astro (SSR, node adapter, astro:env, tailwind vite)
├── drizzle.config.ts                # Config drizzle-kit (schema → db/migrations)
├── docker-compose.yml               # Servicios postgres, app, pgadmin
├── Dockerfile                       # Build multi-stage (deps → builder → runtime)
├── tsconfig.json                    # TypeScript strict (extends astro/strict)
├── .env.example
└── package.json
```

---

## Páginas y routing

El sitio usa **routing de archivos de Astro en modo SSR**. Las páginas de contenido son archivos `.astro`; los programas y las rutas de aprendizaje se sirven **dinámicamente desde la base de datos**.

### Contenido dinámico (desde PostgreSQL)

- `src/pages/programas/[slug].astro` — consulta `db.query.programas.findFirst({ where slug })` y renderiza la variante correspondiente (`ProgramaBachillerato`, `ProgramaMaestria`, `ProgramaTecnico`, `ProgramaCorporativo`).
- `src/pages/rutas/[slug].astro` — consulta la ruta por slug y sus programas asociados.

> **Nota de routing:** si existiera un archivo `.astro` estático con el mismo slug en `programas/` o `rutas/`, Astro prioriza la ruta estática sobre `[slug].astro`. Actualmente no hay páginas estáticas de programa: todo el catálogo proviene de la BD. El listado se gestiona desde `/admin/programas` y se puebla con `npm run db:seed`.

### Páginas de contenido (estáticas `.astro`)

| Sección | Rutas |
|:--------|:------|
| Inicio | `/` |
| Contacto | `/contacto` |
| Acceso | `/login` |
| Admisión | `/admision`, `/admision/proceso`, `/admision/requisitos`, `/admision/financiamiento`, `/admision/solicitar-informacion` |
| Escuela | `/escuela`, `/escuela/director`, `/escuela/docentes`, `/escuela/metodologia` |
| Historias | `/historias`, `/historias/docentes`, `/historias/egresados`, `/historias/estudiantes` |
| Industria y empleabilidad | `/industria-empleabilidad`, `/industria-empleabilidad/alianzas`, `/industria-empleabilidad/certificaciones`, `/industria-empleabilidad/empleabilidad` |
| Blog | `/blog` |
| Landing (conversión) | `/landing/bachillerato-software`, `/landing/maestria-ia`, `/landing/ruta-testing`, `/landing/ux-ui-agil` |
| Programas | `/programas` (índice) · `/programas/[slug]` (dinámico) |
| Rutas | `/rutas` (índice) · `/rutas/[slug]` (dinámico) |

### Área autenticada

| Ruta | Acceso | Descripción |
|:-----|:-------|:------------|
| `/login` | Público | Formulario de acceso institucional |
| `/admin` | Rol `admin` | Panel de administración |
| `/admin/programas` | Rol `admin` | Listado y gestión de programas (`/nuevo`, `/[id]`) |
| `/docentes/perfil` | Autenticado | Perfil editable del docente |

---

## API

Endpoints en `src/pages/api/` (SSR):

| Método | Endpoint | Acceso | Descripción |
|:-------|:---------|:-------|:------------|
| `POST` | `/api/auth/login` | Público | Valida credenciales y emite la cookie `esoft_session` (JWT, `HttpOnly`, `SameSite=Strict`) |
| `POST` | `/api/auth/logout` | Público | Limpia la cookie de sesión (`Max-Age=0`) |
| `GET` | `/api/programas` | Público | Devuelve los programas activos |
| `GET` | `/api/docentes/[id]` | Autenticado | Devuelve un docente por id |
| `PATCH` | `/api/docentes/[id]` | Autenticado | Actualiza el perfil de un docente |

> **`/api/solicitud` no existe a propósito.** El formulario de admisión (`/admision/solicitar-informacion`) está pendiente de conectarse al CRM universitario; el endpoint se implementará en esa fase.

---

## Base de datos

PostgreSQL 16 gestionado con Drizzle ORM. El schema (`src/db/schema.ts`) define:

- **Tablas:** `users`, `docentes`, `programas`, `cursos`, `rutas`, `noticias`, `solicitudes`.
- **Enums:** `rol` (`admin`, `docente`), `tipo_programa` (`bachillerato`, `maestria`, `tecnico`, `ruta_corporativa`), `nivel_programa` (`tecnico`, `bachillerato`, `maestria`).

**Convención Drizzle:** las propiedades TypeScript son **camelCase** aunque la columna en DB sea snake_case (p. ej. `perfilEgresado: text('perfil_egresado')`).

**Migraciones:** se generan con `npm run db:generate` (salida en `db/migrations/`) y se aplican **desde el host** apuntando al puerto 5433:

```bash
DATABASE_URL=postgresql://esoft:PASSWORD@localhost:5433/esoft_db npm run db:migrate
```

**Seed:** `src/db/seed.ts` inserta 15 programas y 5 rutas de aprendizaje (más sus cursos / planes de estudio). **Borra y reinserta** programas, cursos y rutas; **no** toca `users`, `docentes`, `noticias` ni `solicitudes`.

```bash
DATABASE_URL=postgresql://esoft:PASSWORD@localhost:5433/esoft_db npm run db:seed
```

**Primer usuario admin:** no hay UI de registro. Se crea directamente en la tabla `users` (rol `admin`) vía Drizzle Studio (`npm run db:studio`) o un script que use `hashPassword` de `src/lib/password.ts`.

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
| Neutro oscuro | `#7C7B75` | — | Texto secundario, bordes |
| Neutro claro | `#D2D2D2` | — | Separadores, deshabilitado |
| Off-white | `#F8F9FC` | `--color-bg-primary` | Fondo base |

> Para efectos con transparencia se usa el triplete `--color-brand-rgb: 22 74 152` con la sintaxis `rgb(var(--color-brand-rgb) / α)`.

### Reglas de marca

- **El cobalt y los azules dominan.** El magenta **nunca** se usa como fondo grande ni en mayor proporción que los azules: se reserva para CTAs ("Solicitar información"), badges activos y **1–2 acentos por pantalla**.
- **Prohibido el naranja** (`#F97316` y cualquier `orange-*`) y el **púrpura**: no están en el libro de marca.
- **CTAs:** sólidos en magenta (`bg-accent2`) con hover a magenta oscuro (`--color-accent-hover`); los secundarios usan la variante *ghost*.
- **Nunca** usar valores hex directos en clases (`bg-[#a01855]`): usar el token (`bg-accent2-hover`). **Nunca** `pt-[72px]`: usar `pt-[var(--nav-height)]`.
- **Eslogan institucional:** *SOMOS LO QUE SABEMOS.*

### Tipografía

- **Títulos:** **Archivo** (variable) — geométrica tipo DIN, sustituto web del **DIN Alternate Bold** oficial. Token `--font-display`; aplicada a `h1, h2, h3` y `.headline-display`.
- **Cuerpo:** **Inter** (variable). Token `--font-sans`.
- Headlines: `font-weight 800`, `letter-spacing -0.03em`, `line-height 1.06`. Cuerpo: `line-height 1.7`, suavizado antialiased.

### Componentes y efectos CSS de referencia

| Clase | Descripción |
|:------|:------------|
| `.card-premium` / `.card-feature` / `.card-stat` | Superficies de tarjeta con hover de borde cobalt |
| `.btn-primary` | CTA sólido en magenta (`bg-accent2`) |
| `.btn-ghost` | CTA secundario outline con tinte cobalt en hover |
| `.headline-display` | Titular display (Archivo, 800) |
| `.text-gradient-hero` | Gradiente cobalt → azul brillante (`#164A98 → #006AEA`) |
| `.hero-grid` | Cuadrícula de líneas cobalt con mask radial |
| `.aurora-orb` / `.ambient-glow` / `.light-sweep` | Efectos ambientales del hero |
| `.reveal` / `.reveal-stagger` | Animaciones de scroll (fade-up, escalonado) |
| `.section-divider` / `.hr-gradient` | Separadores con gradiente de marca |

---

## Deploy

El despliegue es vía **Docker Compose**. El `Dockerfile` es multi-stage (`deps → prod-deps → builder → runtime`): construye el sitio SSR y la imagen final ejecuta `node ./dist/server/entry.mjs`.

### Servicios (`docker-compose.yml`)

| Servicio | Imagen | Puerto host → contenedor | Notas |
|:---------|:-------|:-------------------------|:------|
| `postgres` | `postgres:16-alpine` | `5433 → 5432` | Volumen `postgres_data`, healthcheck |
| `app` | build local | `4321 → 4321` | `NODE_ENV=production`, depende de `postgres` healthy |
| `pgadmin` | `dpage/pgadmin4` | `5050 → 80` | Solo con `--profile dev` |

### Puesta en marcha

```bash
# 1. Configurar .env (ver Inicio rápido)
cp .env.example .env

# 2. Levantar postgres + app
docker compose up -d

# 3. Aplicar migraciones y seed desde el host (puerto 5433)
DATABASE_URL=postgresql://esoft:PASSWORD@localhost:5433/esoft_db npm run db:migrate
DATABASE_URL=postgresql://esoft:PASSWORD@localhost:5433/esoft_db npm run db:seed

# 4. (Opcional) pgAdmin para administrar la BD
docker compose --profile dev up -d
# → http://localhost:5050
```

La app queda disponible en `http://localhost:4321`. Para reflejar cambios de código en el contenedor hay que reconstruir la imagen (`docker compose up -d --build app`) o dejar corriendo `docker compose watch app` para rebuild automático.

> El despliegue en AWS Amplify quedó descontinuado; ya no forma parte del flujo de este repositorio.

---

## Licencia

Uso interno — Universidad CENFOTEC / ESOFT. Todos los derechos reservados.
</content>
</invoke>
