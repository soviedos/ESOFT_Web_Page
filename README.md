# ESOFT Web — Escuela de Ingeniería de Software

> Sitio web institucional de la **Escuela de Ingeniería de Software (ESOFT)** de la **Universidad CENFOTEC**, Costa Rica.

![Astro](https://img.shields.io/badge/Astro-6.1-FF5D01?logo=astro&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![AWS Amplify](https://img.shields.io/badge/Deploy-AWS_Amplify-FF9900?logo=amazonaws&logoColor=white)

---

## Tabla de contenidos

1. [Descripción general](#descripción-general)
2. [Stack tecnológico](#stack-tecnológico)
3. [Inicio rápido](#inicio-rápido)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Catálogo de páginas](#catálogo-de-páginas)
6. [Design System](#design-system)
7. [Efectos visuales](#efectos-visuales)
8. [Convenciones de desarrollo](#convenciones-de-desarrollo)
9. [Deploy](#deploy)

---

## Descripción general

Sitio estático de alto rendimiento construido con **Astro 6**, orientado a cero JavaScript en el cliente salvo donde es estrictamente necesario. Presenta la oferta académica completa de ESOFT: maestrías, bachillerato, técnicos cuatrimestrales (N5 y N2) y paths de microciclos, con información curricular detallada extraída de los documentos oficiales de la Universidad CENFOTEC.

**Características principales:**

- Light mode institucional con paleta cobalt + naranja sobre fondo off-white
- Sistema de partículas interactivas (canvas, 72 nodos, reactividad al cursor)
- Terminal animada con loop de 11 pasos que simula el flujo de un ingeniero de software
- Animaciones de scroll con `IntersectionObserver` (fade-up individual y escalonado)
- 50 páginas estáticas con contenido académico oficial
- 100% accesible: skip links, `aria-label` en secciones, roles correctos
- Todos los botones "Solicitar información" en naranja institucional (`#F97316`)

---

## Stack tecnológico

| Tecnología | Versión | Propósito |
|:-----------|:--------|:----------|
| [Astro](https://astro.build) | 6.1 | Generador de sitios estáticos (SSG) |
| [Tailwind CSS](https://tailwindcss.com) | 4.2 | Utility-first CSS con `@theme` design tokens |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Tipado estático en scripts de componentes |
| [@astrojs/check](https://www.npmjs.com/package/@astrojs/check) | 0.9 | Verificación de tipos en build |
| Inter (Google Fonts) | — | Tipografía principal, pesos 400–900 |
| Node.js | ≥ 22.12 | Entorno de ejecución |

---

## Inicio rápido

### Requisitos previos

- Node.js ≥ 22.12 (`node -v`)
- npm ≥ 10 (`npm -v`)

### Instalación y desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/soviedos/ESOFT_Web_Page.git
cd ESOFT_Web_Page

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
# → http://localhost:4321
```

### Comandos disponibles

| Comando | Descripción |
|:--------|:------------|
| `npm run dev` | Servidor de desarrollo en `localhost:4321` con HMR |
| `npm run build` | Build de producción optimizado en `./dist/` |
| `npm run preview` | Preview del build local antes de deploy |
| `npm run astro` | CLI de Astro para comandos adicionales |

---

## Estructura del proyecto

```
ESOFT_Web_Page/
├── public/                         # Assets estáticos (imágenes, favicon, logos)
│   ├── ESOFT_Software-Engineering-Azul.png
│   ├── UCENFOTEC_LogoHorizontal-Azul.png
│   ├── Logo_SINAES.jpg
│   └── favicon.svg
│
├── src/
│   ├── components/                 # Componentes Astro reutilizables
│   │   ├── Nav.astro               # Barra de navegación (sticky, blur, z-50)
│   │   ├── Footer.astro            # Footer con CTA y mapa de sitio
│   │   ├── Card.astro              # Card de ruta/programa (9 íconos: development,
│   │   │                           #   testing, design, ai, architecture, routes,
│   │   │                           #   web, database, devops)
│   │   ├── Terminal.astro          # Terminal animada (11 pasos, loop con fade)
│   │   ├── ParticleGrid.astro      # Canvas de partículas interactivas
│   │   └── CodeCard.astro          # Card decorativa de código
│   │
│   ├── layouts/
│   │   └── Base.astro              # Shell HTML global — incluye:
│   │                               #   · hero-grid (cuadrícula fija)
│   │                               #   · glow ambiental top-center
│   │                               #   · ParticleGrid (canvas global)
│   │                               #   · Nav + Footer
│   │
│   ├── pages/                      # 50 páginas estáticas (.astro)
│   │   ├── index.astro             # Landing principal
│   │   ├── contacto.astro
│   │   ├── admision/               # 5 páginas
│   │   ├── blog/                   # 1 página
│   │   ├── calidad-academica/      # 4 páginas
│   │   ├── escuela/                # 4 páginas
│   │   ├── historias/              # 4 páginas
│   │   ├── industria-empleabilidad/ # 4 páginas
│   │   ├── landing/                # 4 páginas de conversión
│   │   ├── programas/              # 15 páginas — ver catálogo
│   │   └── rutas/                  # 6 páginas de especialización
│   │
│   └── styles/
│       └── global.css              # Design system completo:
│                                   #   · @theme (tokens de color y tipografía)
│                                   #   · Componentes (cards, buttons, nav)
│                                   #   · Efectos (aurora, glow, grid, marquee)
│                                   #   · Animaciones (fade-up, blink, pulse-glow)
│                                   #   · Reveal (scroll-triggered, nth-child 1–9)
│
├── astro.config.mjs                # Configuración de Astro + Tailwind Vite plugin
├── tsconfig.json                   # TypeScript strict mode (extends astro/strict)
├── amplify.yml                     # Pipeline CI/CD de AWS Amplify
└── package.json
```

---

## Catálogo de páginas

### Landing principal (`/`)

Página de mayor complejidad visual. Incluye:

- Hero con animaciones de entrada escalonadas (`animate-fade-up`)
- Aurora orb, ambient glow y light sweep (efectos exclusivos del hero)
- Trust bar con 4 estadísticas (count-up animado) y logo SINAES
- Sección "¿Qué es ESOFT?" con Visión y Misión
- Editorial break
- 9 Rutas de especialización en grid 3×3 con stagger reveal
- Programa hero (BISOFT) + dos programas secundarios
- Terminal animada "En producción, hoy"
- Testimonios
- Strip de empresas aliadas (marquee)
- Respaldo institucional UCENFOTEC
- CTA final

### Admisión (`/admision/`)

| Ruta | Contenido |
|:-----|:----------|
| `/admision` | Proceso general, pasos y opciones |
| `/admision/proceso` | Detalle del proceso de admisión |
| `/admision/requisitos` | Requisitos de ingreso por programa |
| `/admision/financiamiento` | Opciones de financiamiento y becas |
| `/admision/solicitar-informacion` | Formulario de contacto |

### Programas (`/programas/`)

**Maestrías — modalidad virtual en vivo**

| Ruta | Nombre oficial | Código | Duración |
|:-----|:---------------|:-------|:---------|
| `/programas/maestria-ingenieria-software-ia` | Maestría en Ing. del Software con Énfasis en IA | MISIA | 2 años · 6 cuatrimestres · 64 cr |
| `/programas/maestria-arquitectura-diseno-software` | Maestría en Ing. del Software con Énfasis en Arq. y Diseño | MISAD | 2 años · 6 cuatrimestres · 64 cr |

**Bachillerato — modalidad virtual en vivo · Acreditado SINAES**

| Ruta | Nombre oficial | Código | Duración |
|:-----|:---------------|:-------|:---------|
| `/programas/bachillerato-ingenieria-software` | Bachillerato en Ingeniería del Software | BISOFT | 3 años · 9 cuatrimestres · 141 cr · 43 cursos |

**Técnicos cuatrimestrales N5 — modalidad virtual en vivo**

| Ruta | Nombre oficial | Código | Duración |
|:-----|:---------------|:-------|:---------|
| `/programas/tecnico-ingenieria-software` | Técnico en Ingeniería del Software | SOFTN5 | 2 años 4 meses · 7 cuatrimestres · 62 cr |
| `/programas/tecnico-desarrollo-web-avanzado` | Técnico en Desarrollo y Diseño Web Avanzado | WEBN5 | 7 cuatrimestres · 61 cr |

**Técnicos cuatrimestrales N2 — modalidad virtual en vivo**

| Ruta | Nombre oficial | Código | Duración |
|:-----|:---------------|:-------|:---------|
| `/programas/tecnico-desarrollo-software` | Técnico en Desarrollo de Software | SOFTN2 | 1 año 4 meses · 4 cuatrimestres · 36 cr |
| `/programas/tecnico-desarrollo-diseno-web` | Técnico en Desarrollo y Diseño Web | WEBTEC | 4 cuatrimestres · 35 cr |

> Los N2 son puerta de entrada y salida lateral de sus respectivos N5.

**Técnicos ágiles — Paths de microciclos (microciclos de 4 semanas)**

| Ruta | Nombre oficial | Horas | Microciclos |
|:-----|:---------------|:------|:------------|
| `/programas/python-foundations` | Python Foundations: Programación Aplicada desde Cero *(base habilitadora)* | 144h | 6 |
| `/programas/path-sql-bases-datos-relacionales` | Desarrollo SQL y Bases de Datos Relacionales | 304h | 13 |
| `/programas/path-nosql-distribuidas` | Bases de Datos NoSQL y Distribuidas | 280h | 12 |
| `/programas/path-vectoriales-ia-rag` | Bases de Datos Vectoriales, IA Generativa y RAG | 328h | 14 |
| `/programas/tecnico-diseno-grafico-web-ux` | Técnico en Diseño Gráfico Web y Experiencia de Usuario | — | 12 (EXUTEC) |
| `/programas/testing-manual-software` | Testing Manual de Software | — | — |
| `/programas/automatizacion-pruebas-software` | Automatización de Pruebas de Software | — | — |
| `/programas/testing-software-ia-sistemas-inteligentes` | Testing de Software con IA | — | — |

> **Python Foundations** es el prerequisito de todos los paths de BD y Testing. Los estudiantes con experiencia previa pueden ingresar directamente mediante prueba de suficiencia.

---

## Design System

### Paleta de colores

Todos los tokens están definidos en el bloque `@theme` de `global.css`. El sitio es **light mode** con fondo off-white.

| Token | Valor | Uso | Contraste WCAG |
|:------|:------|:----|:---------------|
| `--color-bg-primary` | `#F8F9FC` | Fondo base | — |
| `--color-bg-secondary` | `#FFFFFF` | Secciones alternas | — |
| `--color-bg-tertiary` | `#EEF2F8` | Superficies de soporte | — |
| `--color-bg-elevated` | `#E4EAF4` | Elementos destacados | — |
| `--color-content` | `#0F172A` | Texto principal | 19.5:1 ✅ AA |
| `--color-content-secondary` | `#475569` | Texto secundario | 7.0:1 ✅ AA |
| `--color-content-muted` | `#64748B` | Captions / muted | 4.6:1 ✅ AA |
| `--color-brand` | `#1B3A8C` | Azul cobalt institucional | — |
| `--color-brand-hover` | `#2548B5` | Brand en hover | — |
| `--color-accent2` | `#F97316` | Naranja eléctrico (CTAs) | — |
| `--color-accent3` | `#0EA5E9` | Sky blue (datos / stats) | — |

### Componentes CSS de referencia

| Clase | Descripción |
|:------|:------------|
| `.card-premium` | Card con borde `border-border-subtle`, fondo `bg-bg-card` y `hover:shadow-md` |
| `.card-feature` | Card showcase con padding generoso para secciones de programa |
| `.card-stat` | Card de estadística con fondo semitransparente |
| `.btn-primary` | Botón sólido · siempre `bg-accent2 text-white` para "Solicitar información" |
| `.btn-ghost` | Botón outline con `border-border-default` |
| `.headline-display` | `font-weight: 800; letter-spacing: -0.03em; line-height: 1.06` |
| `.text-gradient-hero` | Gradiente cobalt → cyan (texto) |
| `.text-gradient-purple` | Gradiente purple → cyan (texto) |
| `.link-arrow` | Link con flecha `→` animada en hover |
| `.hero-grid` | Cuadrícula de líneas cobalt con mask radial `85% 70%` |
| `.aurora-orb` | Conic-gradient animado, `filter: blur(100px)`, 20s loop |
| `.ambient-glow` | `position: absolute; border-radius: 50%; filter: blur(120px)` |
| `.light-sweep` | `::after` con gradiente y animación de barrido 10s |
| `.reveal` | Fade-up en scroll: `opacity 0 → 1`, `translateY(20px → 0)` |
| `.reveal-stagger` | Igual que `.reveal` pero con `transition-delay` por hijo (1–9) |
| `.marquee-track` | Flex, `animation: marquee 35s linear infinite`, pausa en hover |
| `.section-divider` | Línea de 1px con gradiente brand al centro |

> **Nota:** Si un grid usa `.reveal-stagger` con más de 9 hijos, agregar las reglas `nth-child(n)` correspondientes en `global.css`.

### Tipografía

- **Familia:** Inter (Google Fonts) — `font-family: 'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif`
- **Mínimo en producción:** 14px — nunca texto menor a este tamaño
- **Line-height base:** 1.7
- **Párrafos descriptivos:** `leading-[1.85]`
- **Headlines:** `font-weight 800`, `letter-spacing -0.03em`, `line-height 1.06`
- **Suavizado:** `-webkit-font-smoothing: antialiased`

---

## Efectos visuales

### Efectos globales (aplicados en todas las páginas vía `Base.astro`)

| Efecto | Implementación | Z-index |
|:-------|:---------------|:--------|
| Cuadrícula `hero-grid` | `div` fijo, `background-image` con `linear-gradient` + mask radial | 0 |
| Glow top-center | `div` fijo con `radial-gradient` y `filter: blur(40px)` | 0 |
| Partículas `ParticleGrid` | `<canvas>` fijo, 72 nodos, conexiones reactivas al cursor | 0 |

### Efectos exclusivos del hero del landing

Estos efectos están en `index.astro` y **no** forman parte del layout base:

| Efecto | Clase CSS | Descripción |
|:-------|:----------|:------------|
| Aurora orb | `.aurora-orb` | Conic-gradient animado de 600×600px, 20s loop |
| Ambient glow hero | `.ambient-glow` | Ellipse de 900px con `animate-pulse-glow` |
| Light sweep | `.light-sweep` | Barrido diagonal cada 10s |

### Terminal animada (`Terminal.astro`)

El componente simula el flujo diario de un ingeniero de software en producción:

```
git pull origin main          → Already up to date.
git checkout -b feat/...      → Switched to branch "feat/ai-endpoint"
npm install                   → ✓ 847 packages — 0 vulnerabilities
npm run lint                  → ✓ ESLint: 0 errors, 0 warnings
npm test                      → ✓ 312 tests passed in 1.4s
git add -p                    → ✓ Staged 6 files
git commit -m "feat: ..."     → [feat/ai-endpoint c9f2a11] feat: AI endpoint
git push origin feat/...      → ✓ PR #84 opened → review requested
docker build -t app:2.5.0 .   → ✓ Image built → registry.esoft.dev
kubectl rollout status ...    → ✓ 3/3 pods ready — deploy successful
curl /api/health | jq .status → "ok" ← live in production ✓
```

**Comportamiento:**
- Se activa cuando el componente entra al viewport (threshold: 30%)
- Velocidad de escritura: 38ms/carácter
- Al completar los 11 pasos: pausa 3s → fade-out 0.5s → limpia → fade-in → reinicia
- `prefers-reduced-motion`: muestra versión estática inmediatamente
- Los estilos usan `<style is:global>` para que apliquen a los elementos creados por JavaScript (`document.createElement`)

---

## Convenciones de desarrollo

### Código

- **Sin comentarios de código** salvo que el *porqué* sea no obvio (una restricción oculta, un invariante sutil, un workaround)
- **Sin docstrings ni bloques de comentarios multi-línea**
- **Sin abstracciones prematuras** — tres líneas similares son preferibles a una abstracción innecesaria
- **Sin manejo de errores para escenarios imposibles** — confiar en las garantías del framework

### CSS y componentes

- Todos los botones **"Solicitar información"** usan `bg-accent2 text-white` (`#F97316`)
- El hover de "Solicitar información" usa `hover:bg-orange-600`
- Scripts de componentes Astro que crean elementos con `document.createElement` **deben** usar `<style is:global>` para que los estilos apliquen (los estilos con scope Astro no alcanzan elementos creados en JS)
- Al agregar `.reveal-stagger` a un grid con más de 9 hijos, agregar las reglas `nth-child` en `global.css`

### Git

- Mensajes de commit en formato `type(scope): description` siguiendo Conventional Commits
- **No forzar push** a `main`
- Cada commit debe representar un cambio coherente y funcional

### Imágenes

- Logos institucionales: `/ESOFT_Software-Engineering-Azul.png` y `/UCENFOTEC_LogoHorizontal-Azul.png`
- Logo SINAES: `/Logo_SINAES.jpg`
- Todos los assets estáticos viven en `/public/`

---

## Deploy

### AWS Amplify (automático)

El proyecto se despliega automáticamente en **AWS Amplify** en cada push a `main`:

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm install 22
        - nvm use 22
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .astro/**/*
```

### Pipeline

```
git push origin main
        ↓
AWS Amplify detecta el push
        ↓
npm ci → npm run build
        ↓
Astro genera ./dist/ (50 páginas HTML estáticas)
        ↓
Amplify sirve desde CDN global
```

### Build local antes de push

```bash
npm run build     # Verifica que compile sin errores
npm run preview   # Valida el output en http://localhost:4321
```

---

## Licencia

Uso interno — Universidad CENFOTEC / ESOFT. Todos los derechos reservados.
