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

### Routing — coexistencia estático/dinámico
- `src/pages/programas/[slug].astro` existe pero es bloqueado por las páginas estáticas del mismo directorio (Astro prioriza rutas estáticas). Esto es deuda técnica conocida.
- Los programas en BD solo son servidos por `[slug].astro` si no hay archivo `.astro` estático con ese slug.
- `src/pages/rutas/[slug].astro` tiene el mismo patrón.

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
- Formulario de admisión (`/admision/solicitar-informacion`) pendiente de conectar al CRM universitario. El endpoint `/api/solicitud` no existe intencionalmente por ahora.
- Sin UI de login aún — los endpoints `/api/programas` (POST) y `/api/docentes/[id]` (PATCH) requieren JWT pero no hay página de login implementada.
- AWS Amplify desconectado (`amplify.yml.bak` en repo como referencia histórica).
