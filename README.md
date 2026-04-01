# ESOFT — Escuela de Ingeniería de Software

Sitio web premium de la Escuela de Ingeniería de Software (ESOFT), Universidad CENFOTEC, Costa Rica. Diseño visual inspirado en Apple, Stripe y Vercel.

## Stack

- **Astro** v6.1 — Generador de sitios estáticos
- **Tailwind CSS** v4.2 — Utility-first CSS con `@theme` design tokens
- **Inter** (400–900) — Tipografía principal (Google Fonts)
- **AWS Amplify** — Hosting y CI/CD

## Estructura

```
src/
├── components/     # Nav, Footer, Card (premium components)
├── layouts/        # Base.astro (HTML shell + noise texture)
├── pages/          # 44 páginas (.astro)
│   ├── admision/
│   ├── blog/
│   ├── calidad-academica/
│   ├── escuela/
│   ├── historias/
│   ├── industria-empleabilidad/
│   ├── landing/
│   ├── programas/
│   └── rutas/
├── styles/         # global.css (design system)
```

## Design System

### Paleta de colores

| Token | Color | Uso |
|:------|:------|:----|
| `bg-primary` | `#07070A` | Fondo base (negro profundo) |
| `bg-secondary` | `#0D0D12` | Secciones alternas |
| `bg-tertiary` | `#11131A` | Cards, surfaces |
| `bg-elevated` | `#161A22` | Elementos destacados |
| `content` | `#FFFFFF` | Texto principal |
| `content-secondary` | `#A1A1AA` | Texto secundario |
| `content-muted` | `#71717A` | Texto terciario / captions |
| `brand` | `#00E5FF` | Acento principal (cyan) |
| `accent2` | `#8B5CF6` | Acento secundario (purple) |
| `accent3` | `#34D399` | Acento terciario (green) |

### Utilidades CSS premium

| Clase | Efecto |
|:------|:-------|
| `.card-premium` | Card con hover glow, lift y depth shadow |
| `.card-feature` | Card showcase con top-line accent |
| `.card-stat` | Card glassmorphism para estadísticas |
| `.glass` | Superficie con backdrop-blur y borde sutil |
| `.text-gradient-hero` | Gradiente blanco → cyan |
| `.text-gradient-purple` | Gradiente purple → cyan |
| `.btn-primary` | Botón con glow blur en hover |
| `.btn-ghost` | Botón outline con lift sutil |
| `.btn-cta-final` | Botón CTA de máximo impacto |
| `.reveal` | Scroll-triggered fade-up (IntersectionObserver) |
| `.reveal-stagger` | Fade-up staggered para grids |
| `.noise` | Textura SVG de ruido para profundidad |
| `.aurora-orb` | Orbe animado de luz ambiental |

### Tipografía

- Tamaño mínimo: **14px** (sin texto menor en toda la página)
- Line-height base: **1.7**
- Párrafos descriptivos: **leading-[1.85]**
- Headlines: **font-weight 800**, letter-spacing -0.03em

## Comandos

| Comando | Acción |
|:--------|:-------|
| `npm install` | Instalar dependencias |
| `npm run dev` | Servidor local en `localhost:4321` |
| `npm run build` | Build de producción en `./dist/` |
| `npm run preview` | Preview del build local |

## Deploy

El proyecto se despliega automáticamente en **AWS Amplify** al hacer push a la rama `main`. La configuración está en `amplify.yml`.
