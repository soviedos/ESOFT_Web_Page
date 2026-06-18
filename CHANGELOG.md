# Changelog — ESOFT Web

Historial de cambios del sitio web institucional de ESOFT, Universidad CENFOTEC.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).
Los mensajes de commit siguen [Conventional Commits](https://www.conventionalcommits.org/).

---

## [Unreleased]

### Añadido

- **Login y sesión:** página `/login` (`src/pages/login.astro`) conectada a `POST /api/auth/login` y `POST /api/auth/logout`; autenticación JWT con `jose` en cookie `esoft_session` (`HttpOnly`, `SameSite=Strict`)
- **Panel de administración:** `/admin` y `/admin/programas` (índice, `nuevo`, `[id]`) para gestionar programas; `POST /api/programas` protegido por rol `admin`
- **Perfil de docente self-service:** `/docentes/perfil` con `GET`/`PATCH /api/docentes/[id]` autenticados
- Tokens RGB de marca (`--color-brand-rgb`) para efectos con transparencia centralizados en `@theme`
- Rebuild automático del contenedor `app` vía `docker compose watch`

### Modificado

- **Refactor de marca al libro oficial CENFOTEC / ESOFT:** paleta migrada a cobalt `#164A98` + magenta `#C81F66` (CTAs) con sus tokens en `@theme`; tipografía de títulos geométrica tipo DIN (**Archivo**) y cuerpo en **Inter**; CTAs en magenta con hover oscuro y variante *ghost* para secundarios; terminal, partículas y glows recolorados a la paleta de marca
- **Routing de programas y rutas 100% dinámico:** eliminadas las páginas estáticas de programa; ahora se sirven desde la BD vía `[slug].astro`
- **Secretos de servidor migrados a `astro:env/server`** (`DATABASE_URL`, `SESSION_SECRET`), reemplazando los checks manuales de `process.env`
- Eliminada la sección de calidad académica (`/calidad-academica`) y sus enlaces en Nav y Footer
- **Documentación actualizada al estado real:** `README.md` reescrito (SSR, Docker, paleta de marca, API, routing dinámico) y `CLAUDE.md` corregido (routing dinámico, estado del proyecto)

### Corregido

- **Auth en SSR:** check de `SESSION_SECRET` resuelto para Astro 6 SSR vía `astro:env/server`
- Eliminados naranja (`#F97316`/`orange-*`) y púrpura fuera del libro de marca; corregidos hallazgos de auditoría visual (hero, avatares, magenta off-token)

---

## [2026-06-01] — Paths de Bases de Datos y documentación profesional

### Añadido

- Página **Python Foundations: Programación Aplicada desde Cero** (`/programas/python-foundations`) — 6 microciclos, 144 horas, base habilitadora para todos los paths de BD y Testing
- Página **Desarrollo SQL y Bases de Datos Relacionales** (`/programas/path-sql-bases-datos-relacionales`) — 13 microciclos (12×24h + proyecto 16h), 304 horas, con contenido detallado de los 4 temas por microciclo
- Página **Bases de Datos NoSQL y Distribuidas** (`/programas/path-nosql-distribuidas`) — 12 microciclos, 280 horas, con contenido detallado
- Página **Bases de Datos Vectoriales, IA Generativa y RAG** (`/programas/path-vectoriales-ia-rag`) — 14 microciclos, 328 horas, con contenido detallado
- `CONTRIBUTING.md` con guía completa de flujo de trabajo, convenciones de commits, código y checklist de deploy
- `CHANGELOG.md` (este archivo)

### Modificado

- `README.md` reescrito a nivel profesional: badges, tabla de contenidos, catálogo completo de 50 páginas, paleta de colores correcta (light mode), design system, efectos visuales, convenciones y pipeline de deploy
- Índice de programas (`/programas`) — sección de Técnicos ágiles reorganizada por grupos: base habilitadora, paths BD, paths Testing, diseño
- Nombres oficiales de los 3 cards de paths de BD corregidos en el índice

---

## [2026-05-28] — Técnicos cuatrimestrales N2 y restructuración de programas

### Añadido

- Página **Técnico en Desarrollo de Software (SOFTN2)** — 4 cuatrimestres, 10 materias, 36 créditos, puerta de entrada al SOFTN5
- Página **Técnico en Desarrollo y Diseño Web (WEBTEC)** — 4 cuatrimestres, 9 materias, 35 créditos, prerequisito del WEBN5
- Sección de técnicos ágiles reorganizada en índice de programas con separación por nivel (N5 y N2)

### Modificado

- Índice de programas: orden corregido a Maestrías → Bachillerato → Técnicos N5 → Técnicos N2

---

## [2026-05-27] — Maestrías y técnicos cuatrimestrales N5 con información oficial

### Añadido

- Páginas completas de **MISIA** y **MISAD** con: stats del programa, perfiles de ingreso/egreso, malla curricular de 6 cuatrimestres con ciclo nivelatorio, electivos del énfasis con requisitos, áreas disciplinarias, ejes curriculares y CTA
- Páginas completas de **SOFTN5** (Técnico en Ingeniería del Software) y **WEBN5** (Técnico en Desarrollo y Diseño Web Avanzado) con malla curricular detallada, roles SFIA, salida lateral y cuatrimestres diferenciados por nivel

### Corregido

- Modalidad de todas las páginas corregida a **Virtual en vivo** (MISIA y MISAD tenían "Presencial" incorrectamente)

---

## [2026-05-25] — BISOFT completo y actualización de landing

### Añadido

- Página de **BISOFT** completamente reescrita con datos del PDF oficial: perspectiva laboral (97% empleo, 2 meses promedio, ¢987,524 mensual, 4.47/5 satisfacción), 10 roles de salida, 6 diferenciadores, áreas disciplinares con barras de progreso, malla curricular 2025 completa (43 cursos en 9 cuatrimestres con electivas), ejes curriculares y transversales
- **Malla curricular completa** del BISOFT: 9 cuatrimestres × todos los cursos con códigos (SOFT-xx, FUN-xx, TI-xx, CIB-xx, SINT-xx), créditos y campos de electivas
- Credencial SINAES con logo en la card de stats del landing

### Modificado

- Card de BISOFT en el landing: título corregido a "Ingeniería del Software" (con "del"), descripción actualizada con tagline y 141 créditos, stats cambiados a 141 cr, 97% empleo y 2 meses
- Duración del bachillerato corregida a **3 años** (no 4) en todos los lugares

---

## [2026-05-23] — Técnico en Diseño Gráfico Web y UX (EXUTEC)

### Añadido

- Página completa del **Técnico en Diseño Gráfico Web y Experiencia de Usuario (EXUTEC)**: 13 cursos en 12 microciclos de 4 semanas, perfil de entrada (9° año), 5 roles de salida, 3 razones del programa

### Corregido

- Duración de microciclos del EXUTEC: 5 semanas → **4 semanas**

---

## [2026-05-22] — Paths técnicos ágiles y rutas de especialización

### Añadido

- 9 áreas de especialización en el landing (de 6 → 9): Desarrollo de Software, Inteligencia Artificial, Arquitectura y Diseño, QA & Testing, UX/UI y Diseño Web, **Desarrollo Web**, **Bases de Datos**, **DevOps & MLOps**, Elegí tu ruta
- Íconos SVG `web`, `database` y `devops` en `Card.astro`
- Reglas `nth-child` 7–9 en `reveal-stagger` para mostrar la tercera fila de cards

### Modificado

- Grid de rutas: de 3 columnas a **3 columnas** (9 cards en 3 filas)

---

## [2026-05-20] — Contenido institucional: Visión, Misión y correcciones

### Añadido

- **Visión y Misión** de ESOFT en la sección "¿Qué es ESOFT?" (dos columnas)
- Logo SINAES reemplaza el texto "SINAES" en la card de estadísticas; card actualizada a "Carrera acreditada · Bachillerato en Ingeniería del Software"

### Modificado

- Sección "¿Qué es ESOFT?": logos removidos, descripción simplificada a frase institucional, título centrado, logos de Visión/Misión centrados
- Frase editorial: "moda" → "aislada del mundo real"
- Signos de interrogación agregados: "el ¿porqué?, el ¿cómo? y el ¿para quién?"
- Stats: +1,200 → **+200** egresados; 80+ → **100+** docentes; etiqueta "Profesionales tech como docentes" → "Docentes activos de la industria tecnológica"
- Estadísticas del landing: descripción del texto actualizado con redacción correcta
- Footer: texto centrado, separadores y redacción final

---

## [2026-05-18] — Botones naranja y correcciones de UI

### Modificado

- **Todos los botones "Solicitar información"** cambiados a `bg-accent2` (naranja `#F97316`) en 25 archivos mediante script Python de reemplazo masivo
- Botón del hero (que era ghost/outline) también actualizado a naranja sólido

---

## [2026-05-15] — Efectos visuales globales y terminal con loop

### Añadido

- **Efectos globales** en `Base.astro`: glow top-center fijo con radial-gradient sutil
- **Terminal en loop**: 11 pasos del flujo completo de un ingeniero, fade-out/fade-in al completar, reset automático
- Íconos `web`, `database`, `devops` en `Card.astro`

### Corregido

- **Bug crítico de terminal**: los estilos Astro con scope (`data-astro-cid`) no aplicaban a los elementos creados con `document.createElement`. Corregido cambiando a `<style is:global>` — el texto era invisible sobre el fondo oscuro del terminal
- Mask del `hero-grid` expandido: `60%×55%` → `85%×70%` para mayor cobertura en páginas internas

---

## [2026-05-10] — Landing y estructura inicial

### Añadido

- Estructura base del proyecto: Astro 6, Tailwind CSS 4, TypeScript strict
- Landing principal con todas las secciones: hero, stats, ¿Qué es ESOFT?, editorial break, rutas, programas, terminal, testimonios, industria, marquee, respaldo institucional, CTA final
- Layout `Base.astro` con `ParticleGrid` y `hero-grid` globales
- 50 páginas estáticas en secciones: admisión, escuela, calidad académica, industria, historias, rutas, programas, landing, blog
- Design system en `global.css`: tokens de color, tipografía, componentes, animaciones
- Deploy en AWS Amplify con `amplify.yml`
- Logos institucionales en formato `-Azul.png` nativos (sin filtros CSS)

---

[Unreleased]: https://github.com/soviedos/ESOFT_Web_Page/compare/main...HEAD
