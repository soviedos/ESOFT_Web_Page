# CLAUDE.md — Contexto del proyecto ESOFT Web

## Propósito
Sitio web institucional de la Escuela de Ingeniería del Software (ESOFT) de la Universidad CENFOTEC, Costa Rica. Muestra programas académicos, perfiles de docentes y rutas de aprendizaje. Tiene un panel admin para gestionar contenido sin tocar código.

## Stack

- **Astro 6.x** — modo `output: 'server'` (SSR). No es estático. No usar `@astrojs/tailwind` (es v3); usar `@tailwindcss/vite`.
- **@astrojs/node** — adapter standalone. Entry point en producción: `dist/server/entry.mjs`.
- **Tailwind CSS v4** — design tokens en `src/styles/global.css` bajo `@theme {}`.
- **Drizzle ORM + PostgreSQL 16** — cliente en `src/db/client.ts`, schema en `src/db/schema.ts`.
- **JWT con `jose`** — cookie `esoft_session`. Auth en `src/lib/auth.ts`.
- **Docker Compose** — postgres (puerto host 5433, interno 5432), app (4321), pgadmin (5050, profile dev).

## Convenciones críticas

### Drizzle schema
- Los nombres de propiedades TypeScript son **camelCase** aunque el column en DB sea snake_case.
- Ejemplo correcto: `perfilEgresado: text('perfil_egresado')`.
- Los enums válidos están definidos en `schema.ts`: `tipoPrograma` y `nivelPrograma`.

### Migraciones
- Se generan con `npm run db:generate`.
- Se aplican **desde el host**, no desde el contenedor: `DATABASE_URL=postgresql://esoft:PASS@localhost:5433/esoft_db npm run db:migrate`.
- Los archivos de migración están en `db/migrations/` (raíz del proyecto, no en `src/`).

### Routing — programas y rutas 100% dinámicos
- Las páginas estáticas de programa fueron eliminadas. Hoy `src/pages/programas/` contiene solo `index.astro` (índice) y `[slug].astro`; `src/pages/rutas/` igual.
- Los programas y rutas se sirven **dinámicamente desde la BD** vía `[slug].astro` (`db.query.programas.findFirst({ where slug })` / `db.query.rutas.findFirst`). El listado se gestiona desde `/admin/programas` y se puebla con `npm run db:seed`.
- Salvedad vigente: Astro prioriza rutas estáticas sobre `[slug].astro`. Si en el futuro se agrega un `.astro` con el mismo slug en esos directorios, ese archivo bloquearía al dinámico — por eso no deben crearse páginas estáticas de programa/ruta.

### Variables de entorno requeridas
```
DATABASE_URL=postgresql://esoft:PASSWORD@localhost:5433/esoft_db  # desde host
DATABASE_URL=postgresql://esoft:PASSWORD@postgres:5432/esoft_db   # desde container
SESSION_SECRET=string-seguro-minimo-32-chars
PUBLIC_SITE_URL=https://esoft.ucenfotec.ac.cr
```
Tanto `DATABASE_URL` como `SESSION_SECRET` lanzan `Error` al inicio si no están definidas.

### CSS
- Nunca usar `bg-[#a01855]` directo — usar `bg-accent2-hover` (token en `@theme`).
- Nunca usar `pt-[72px]` directo — usar `pt-[var(--nav-height)]`.
- `--color-brand` = `#164a98` (azul CENFOTEC).
- `--color-accent2` = `#c81f66` (magenta ESOFT, para CTAs).

## Sistema visual — Libro de marca CENFOTEC / ESOFT

Reglas oficiales del libro de marca (Escuela de Software Engineering). **Deben respetarse en todo cambio visual de aquí en adelante.**

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
| Off-white | `#F8F9FC` | Fondo base existente |

### Reglas de uso
- El **cobalt y los azules dominan**. El magenta **nunca** se usa como fondo grande ni en mayor proporción que los azules; se reserva para CTAs ("Solicitar información"), badges activos y **1–2 acentos por pantalla**.
- **PROHIBIDO el naranja** (`#F97316` y cualquier `orange-*`) y el **púrpura**: no están en el libro de marca.
- **Tipografía de títulos:** geométrica tipo DIN — **Archivo** como sustituto web del DIN Alternate Bold oficial.
- **Tipografía de cuerpo:** **Inter**.
- **Eslogan institucional:** "SOMOS LO QUE SABEMOS".

## Estructura de componentes
```
src/components/
  ui/           — átomos: CTAButton, Breadcrumb, SectionBadge, BulletItem, StatCard, TechBadge
  sections/     — moléculas: ProgramaHero, CurriculumSection, InfoCTA, TechGrid, RutaLayout
  programa/     — ProgramaLayout (motor) + 4 variantes: Bachillerato, Maestria, Tecnico, Corporativo
```

## Seed de la base de datos

Poblar todos los programas, cursos y rutas de aprendizaje desde cero:

```bash
# Desde el host (no desde el contenedor Docker):
DATABASE_URL=postgresql://esoft:PASS@localhost:5433/esoft_db npm run db:seed
```

El seed (`src/db/seed.ts`) incluye:
- 15 programas (bachillerato, 2 maestrías, 7 técnicos, 3 paths, python foundations)
- ~130 cursos para los programas que tienen plan de estudios
- 5 rutas de aprendizaje vinculadas a los programas

**ADVERTENCIA:** el seed borra y reinserta programas, cursos y rutas. No toca users, docentes, noticias ni solicitudes.

## Crear el primer usuario admin

No hay UI de registro. El primer admin se crea directamente en la BD:

```bash
# Opción 1 — Drizzle Studio (recomendado para no-técnicos)
DATABASE_URL=postgresql://esoft:PASS@localhost:5433/esoft_db npm run db:studio
# → Abrir http://localhost:4983, tabla users, insertar fila manualmente

# Opción 2 — Script Node (requiere calcular el hash con src/lib/password.ts)
# Usar hashPassword('contraseña') e insertar en la tabla users con rol='admin'
```

## Comandos frecuentes
```bash
npm run dev          # servidor de desarrollo
npm run build        # build de producción
npm run check        # verificación de tipos TypeScript
npm run db:generate  # generar migración desde schema
npm run db:migrate   # aplicar migraciones (requiere DATABASE_URL)
npm run db:studio    # UI de Drizzle Studio

docker compose up -d                    # levantar postgres + app
docker compose --profile dev up -d     # + pgadmin en :5050
```

## Estado del proyecto (junio 2026)

### Implementado
- **Autenticación:** UI de login en `/login` (`src/pages/login.astro`) conectada a `/api/auth/login` y `/api/auth/logout`. JWT con `jose` en cookie `esoft_session` (`HttpOnly`, `SameSite=Strict`). Secretos validados vía `astro:env/server`.
- **Panel admin:** `/admin` y `/admin/programas` (índice, `nuevo`, `[id]`) para gestionar programas. `POST /api/programas` requiere rol `admin`.
- **Perfil de docente self-service:** `/docentes/perfil` (`src/pages/docentes/perfil.astro`); `GET`/`PATCH /api/docentes/[id]` requieren autenticación.
- **Routing dinámico:** programas y rutas servidos desde BD vía `[slug].astro` (ver sección Routing).
- **Despliegue:** Docker Compose (postgres, app, pgadmin). AWS Amplify descontinuado — no quedan archivos `amplify*` en el repo.

### Pendiente
- **Formulario de admisión → CRM:** `/admision/solicitar-informacion` aún no conecta al CRM universitario; el endpoint `/api/solicitud` no existe intencionalmente por ahora.
- **Endurecimiento de auth:** falta robustecer el flujo (p. ej. rate limiting, manejo de expiración/refresh, protección de rutas más allá del check de JWT).
- **Modelo académico:** el schema aún no modela la oferta 360 / paths / cursos sueltos como entidades de primer nivel.
- **Bot / RAG:** asistente conversacional con RAG no iniciado (existe la variable `AI_API_KEY` en `.env.example` como reserva).
