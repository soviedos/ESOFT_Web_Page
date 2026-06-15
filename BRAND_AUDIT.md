# Auditoría de consistencia de marca — ESOFT Web

Referencia: sección "Sistema visual — Libro de marca CENFOTEC / ESOFT" de `CLAUDE.md`.

**Paleta válida:** Azules `#164A98` / `#006AEA` / `#9CC8FF` · Magenta `#C81F66` / `#A81857` (solo acciones y acentos puntuales) · Fondos `--color-bg-*` · Texto `--color-content-*` · Neutros `#7C7B75` / `#D2D2D2`.

- **Archivos revisados:** 59 (`.astro`) → 38 en `src/pages/`, 21 en `src/components/`.
- **Fecha:** 2026-06-15.
- **Severidad:** alta = color prohibido / violación de proporción · media = hex en vez de token · baja = matiz menor.

---

## Resumen de hallazgos

| Severidad | Total | Resueltos | Pendiente (revisión humana) |
|---|---|---|---|
| Alta  | 4 | 4 | 0 |
| Media | 4 | 4 | 0 |
| Baja  | 2 | 1 | 1 |
| **Total** | **10** | **9** | **1** |

> Actualización 2026-06-15: resueltos los 3 pendientes (verde/avatares, sky `accent3`, 2 errores de `check`). Queda solo 1 hallazgo de severidad baja (normalización del cobalt `#1B3A8C`).

No se encontraron violaciones de **proporción** (ningún fondo magenta grande: el magenta solo aparece en CTAs, badges y acentos chicos) ni **encabezados fuera de la fuente DIN** (la regla global `h1, h2, h3 { font-family: var(--font-display) }` en `global.css` cubre todos los títulos; ningún archivo la sobrescribe). Todos los CTAs "Solicitar información" usan `bg-accent2` + `hover:bg-accent-hover` (verificado).

---

## Hallazgos por archivo

### src/components/programa/ProgramaMaestria.astro
- **Línea 8** · Severidad **ALTA** · `heroGradient="rgba(139,92,246,0.06)"` → **púrpura `#8B5CF6` prohibido**.
  - Corrección: migrar a azul de marca. **✅ Auto-corregido → `rgba(0,106,234,0.06)`** (sin significado semántico; el resto de programas usa el cobalt por defecto).

### src/components/Footer.astro
- **Línea 40** · Severidad **ALTA** · `ambient-glow` con `rgba(0,229,255,0.04)` → **cian fuerte `#00E5FF` prohibido**.
  - Corrección: migrar a azul de marca. **✅ Auto-corregido → `rgba(0,106,234,0.04)`**.

### src/pages/index.astro
- **Línea 199** · Severidad **ALTA** · avatar de testimonio con `background: rgba(52,211,153,0.12)` (**verde esmeralda `#34D399`**) + `text-accent3`. Verde decorativo (no semántico de estado) → prohibido.
  - Corrección: alinear con los avatares hermanos (cobalt/magenta). **✅ Auto-corregido → `background: rgba(0,106,234,0.10)` + `text-brand`**.
- **Línea 33** · Severidad **BAJA** · punto del badge con `background: #c81f66` hardcodeado (color correcto, pero hex en vez de token).
  - Corrección: **✅ Auto-corregido → `var(--color-accent2)`**.
- **Líneas 314, 396–397** · Severidad **ALTA** · uso de `text-accent3` / `rgba(14,165,233,0.10)` = **sky blue `#0EA5E9`**, fuera de la paleta oficial (token `--color-accent3`).
  - ✅ **RESUELTO** — avatares de testimonios unificados al tinte de marca: blues con `text-brand bg-brand-soft`, acentos magenta con `text-accent2 bg-accent2-soft`. El avatar grande "DV" (396/397) conserva su gradiente para mantener consistencia con sus hermanos AC/MR, con el stop sky reemplazado por cobalt y texto `text-brand`. Token `--color-accent3` repunteado a `#006AEA` (ver abajo).

### src/pages/login.astro · src/pages/docentes/perfil.astro · src/pages/admin/programas/nuevo.astro · src/pages/admin/programas/[id].astro
- **Líneas 39 / 95 / 59 / 89** · Severidad **MEDIA** · caja de aviso con `color: #9b1153` → magenta oscuro **fuera de token** (bg/borde ya usan `rgba(200,31,102,…)` correcto).
  - Corrección: normalizar al token magenta oscuro. **✅ Auto-corregido → `color: var(--color-accent-hover)`** (`#A81857`) en los 4 archivos.

### src/components/sections/ProgramaHero.astro (+ default propagado)
- **Línea 33** · Severidad **BAJA** · `heroGradient = 'rgba(27,58,140,0.05)'` (= `#1B3A8C`, cobalt cercano pero **no exactamente** `#164A98`). Mismo matiz aparece en `global.css` (`.hero-grid`, `.section-divider`) y en el badge del hero (`index.astro:32`).
  - ⚠️ **Requiere revisión humana** — azul en familia, decorativo y de baja opacidad; normalizarlo a `rgba(22,74,152,…)` es deseable pero toca varios puntos con un cambio visual sutil. Recomendado hacerlo en un pase aparte.

---

## Casos aceptables (no son violaciones)

- **Badges de estado en admin** (`admin/programas/index.astro:76`, `admin/programas/[id].astro:222`): verde `#166534` / `rgba(22,163,74,…)` para "Activo". Es **color semántico de estado**, permitido explícitamente por el criterio de auditoría.
- **Neutros oscuros del Terminal** (`Terminal.astro`: `#0F172A`, `#1E293B`, `#475569`, `#64748B`, `#E2E8F0`): chrome de una UI de terminal oscura; neutros locales del componente, no acentos de marca.
- **Fuentes**: ningún encabezado fuera de DIN. `font-mono` se usa solo para código/IDs de curso (`CurriculumSection`, snippet en admin) — intencional.

---

## Resueltos (antes "Requiere revisión humana")

1. ✅ **Token `--color-accent3` (sky blue `#0EA5E9`) → `#006AEA`** — `global.css:24` repunteado al azul brillante de marca; comentario actualizado ("azul de datos/stats, NO cian"). Todos los usos `text-accent3` decorativos en avatares fueron migrados a `text-brand`. Grep confirma **0** ocurrencias de `#0EA5E9` y **0** utilidades `sky-*`/`cyan-*` en `src/`.

2. ✅ **Verde decorativo + unificación de avatares** — todos los avatares de testimonios de `index.astro` quedan consistentes: blues con `text-brand bg-brand-soft`, magenta de acento con `text-accent2 bg-accent2-soft`. Sin verde ni sky.

3. ✅ **Errores de `npm run check` corregidos:**
   - `ProgramaHero.astro:61` — `variante="secondary"` (inexistente) → `variante="ghost"` (outline). Es el CTA **secundario** del hero ("Proceso de admisión"); el primario magenta sigue siendo "Solicitar información". No quedan dos CTAs magenta en el bloque.
   - `seed.ts:556` — `getPool()` (no definido) → `_pool.end()` (el `Pool` real declarado en `seed.ts:16`).

## Requiere revisión humana (pendiente menor)

1. **Cobalt cercano `rgba(27,58,140)` (`#1B3A8C`)** — `ProgramaHero.astro:33` (default), `global.css` (`.hero-grid`, `.section-divider`), `index.astro:32`.
   - Azul en familia pero off-token (severidad baja). **Recomendación:** normalizar a `rgba(22,74,152,…)` (`#164A98`) en un pase dedicado.
