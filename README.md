# ESOFT — Escuela de Ingeniería de Software

Sitio web institucional de la **Escuela de Ingeniería de Software (ESOFT)** de la **Universidad CENFOTEC**, Costa Rica. Diseño light-mode premium con sistema de partículas interactivas, animaciones de scroll y contenido académico completo.

## Stack

| Tecnología | Versión | Uso |
|:-----------|:--------|:----|
| **Astro** | 6.1 | Generador de sitios estáticos |
| **Tailwind CSS** | 4.2 | Utility-first CSS con `@theme` design tokens |
| **TypeScript** | 5.9 | Tipado en componentes Astro |
| **@astrojs/check** | 0.9 | Verificación de tipos en build |
| **Inter** (400–900) | — | Tipografía principal (Google Fonts) |
| **Node.js** | ≥22.12 | Entorno de ejecución |

## Estructura del proyecto

```
src/
├── components/
│   ├── Nav.astro           # Navegación principal (sticky, blur)
│   ├── Footer.astro        # Footer con CTA y mapa de sitio
│   ├── Card.astro          # Card de ruta/programa (9 íconos SVG)
│   ├── Terminal.astro      # Terminal animada (11 pasos, loop con fade)
│   ├── ParticleGrid.astro  # Canvas de partículas interactivas
│   └── CodeCard.astro      # Card de código decorativa
│
├── layouts/
│   └── Base.astro          # Shell HTML global (hero-grid, partículas, glow)
│
├── pages/                  # 50 páginas estáticas (.astro)
│   ├── index.astro         # Landing principal
│   ├── contacto.astro
│   ├── admision/           # 5 páginas (proceso, requisitos, financiamiento…)
│   ├── blog/
│   ├── calidad-academica/  # 4 páginas
│   ├── escuela/            # 4 páginas (director, docentes, metodología…)
│   ├── historias/          # 4 páginas (egresados, estudiantes, docentes…)
│   ├── industria-empleabilidad/ # 4 páginas
│   ├── landing/            # 4 páginas de conversión por programa
│   ├── programas/          # 15 páginas — ver detalle abajo
│   └── rutas/              # 6 páginas de rutas de especialización
│
└── styles/
    └── global.css          # Design system completo (tokens, componentes, animaciones)
```

### Páginas de programas (`/programas/`)

**Maestrías (modalidad virtual en vivo)**
| Página | Programa | Código |
|:-------|:---------|:-------|
| `maestria-ingenieria-software-ia` | Maestría en Ing. del Software — Énfasis IA | MISIA |
| `maestria-arquitectura-diseno-software` | Maestría en Ing. del Software — Énfasis Arq. y Diseño | MISAD |

**Bachillerato (modalidad virtual en vivo)**
| Página | Programa | Código |
|:-------|:---------|:-------|
| `bachillerato-ingenieria-software` | Bachillerato en Ingeniería del Software | BISOFT |

**Técnicos cuatrimestrales (modalidad virtual en vivo)**
| Página | Programa | Nivel |
|:-------|:---------|:------|
| `tecnico-ingenieria-software` | Técnico en Ingeniería del Software | SOFTN5 |
| `tecnico-desarrollo-web-avanzado` | Técnico en Desarrollo y Diseño Web Avanzado | WEBN5 |
| `tecnico-desarrollo-software` | Técnico en Desarrollo de Software | SOFTN2 |
| `tecnico-desarrollo-diseno-web` | Técnico en Desarrollo y Diseño Web | WEBTEC |

**Técnicos ágiles — Paths de microciclos**
| Página | Programa | Horas |
|:-------|:---------|:------|
| `python-foundations` | Python Foundations: Programación Aplicada desde Cero *(base habilitadora)* | 144h |
| `path-sql-bases-datos-relacionales` | Desarrollo SQL y Bases de Datos Relacionales | 304h |
| `path-nosql-distribuidas` | Bases de Datos NoSQL y Distribuidas | 280h |
| `path-vectoriales-ia-rag` | Bases de Datos Vectoriales, IA Generativa y RAG | 328h |
| `tecnico-diseno-grafico-web-ux` | Técnico en Diseño Gráfico Web y Experiencia de Usuario | EXUTEC |
| `testing-manual-software` | Testing Manual de Software | — |
| `automatizacion-pruebas-software` | Automatización de Pruebas de Software | — |
| `testing-software-ia-sistemas-inteligentes` | Testing de Software con IA | — |

## Design System

### Paleta de colores (light mode)

| Token | Color | Uso |
|:------|:------|:----|
| `bg-primary` | `#F8F9FC` | Fondo base (off-white) |
| `bg-secondary` | `#FFFFFF` | Secciones alternas |
| `bg-tertiary` | `#EEF2F8` | Fondos de soporte |
| `bg-elevated` | `#E4EAF4` | Elementos destacados |
| `content` | `#0F172A` | Texto principal (19.5:1 ✅) |
| `content-secondary` | `#475569` | Texto secundario (7.0:1 ✅) |
| `content-muted` | `#64748B` | Captions (4.6:1 ✅) |
| `brand` | `#1B3A8C` | Azul institucional cobalt |
| `accent2` | `#F97316` | Naranja eléctrico (CTAs) |
| `accent3` | `#0EA5E9` | Sky blue (datos/stats) |

### Componentes CSS

| Clase | Efecto |
|:------|:-------|
| `.card-premium` | Card con borde sutil, hover lift y sombra |
| `.card-feature` | Card showcase para secciones hero |
| `.card-stat` | Card para estadísticas con fondo semitransparente |
| `.text-gradient-hero` | Gradiente cobalt → cyan |
| `.text-gradient-purple` | Gradiente purple → cyan |
| `.btn-primary` | Botón sólido con transición suave |
| `.btn-ghost` | Botón outline con hover sutil |
| `.hero-grid` | Cuadrícula de líneas cobalt con mask radial |
| `.aurora-orb` | Orbe de luz ambiental animado (conic-gradient) |
| `.ambient-glow` | Blur radial para fondos de sección |
| `.reveal` | Fade-up activado por IntersectionObserver |
| `.reveal-stagger` | Fade-up escalonado para grids (hasta 9 hijos) |
| `.marquee-track` | Carrusel infinito de logos |
| `.link-arrow` | Link con flecha animada en hover |

### Tipografía

- **Fuente:** Inter (Google Fonts) — pesos 400, 500, 600, 700, 800, 900
- **Mínimo:** 14px — nunca menor en producción
- **Line-height base:** 1.7 — párrafos descriptivos: 1.85
- **Headlines:** `font-weight 800`, `letter-spacing -0.03em`, `line-height 1.06`

## Efectos visuales globales

Todos los efectos están en `Base.astro` y aplican a todas las páginas:

- **`ParticleGrid`** — canvas fijo con 72 partículas que responden al cursor del mouse
- **`hero-grid`** — cuadrícula de líneas cobalt con mask radial (85%×70%)
- **Glow superior** — div fijo con gradiente radial sutil (cobalt + naranja) en el top-center

## Terminal animada

El componente `Terminal.astro` simula un flujo de trabajo de un ingeniero de software:

- **11 pasos:** `git pull` → branch → install → lint → test → commit → push → docker → kubectl → health check
- **Loop con fade:** al completar, espera 3s, hace fade-out (0.5s) y reinicia
- **Activación:** se inicia cuando el componente entra al viewport (IntersectionObserver, threshold 30%)
- **Reduced motion:** muestra versión estática si el usuario tiene reducción de movimiento activada
- **CSS global:** usa `<style is:global>` para que los elementos creados dinámicamente reciban los estilos correctamente

## Comandos

| Comando | Acción |
|:--------|:-------|
| `npm install` | Instalar dependencias |
| `npm run dev` | Servidor local en `localhost:4321` |
| `npm run build` | Build de producción en `./dist/` |
| `npm run preview` | Preview del build local |

## Convenciones de desarrollo

- **Sin comentarios de código** salvo que el *porqué* sea no obvio
- **Sin clases CSS vacías** ni utilidades redundantes
- **Botones "Solicitar información"** usan siempre `bg-accent2` (naranja `#F97316`)
- **`reveal-stagger`** requiere agregar `nth-child` en `global.css` si el grid supera 9 hijos
- **Animaciones JS en componentes Astro** deben usar `<style is:global>` si los elementos los crea `document.createElement`

## Deploy

El proyecto se despliega automáticamente en **GitHub** al hacer push a la rama `main`.
