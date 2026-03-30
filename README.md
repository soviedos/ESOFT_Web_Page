# ESOFT — Escuela de Ingenieria de Software

Sitio web premium de la Escuela de Ingenieria de Software (ESOFT), Universidad CENFOTEC, Costa Rica. Diseno visual inspirado en Apple, Stripe y Vercel.

## Stack

- **Astro** v6.1 — Generador de sitios estaticos
- **Tailwind CSS** v4.2 — Utility-first CSS con `@theme` design tokens
- **Inter** (400–800) — Tipografia principal (Google Fonts)
- **AWS Amplify** — Hosting y CI/CD

## Estructura

```
src/
├── components/     # Nav, Footer, Card (premium components)
├── layouts/        # Base.astro (HTML shell + noise texture)
├── pages/          # 44 paginas (.astro)
│   ├── admision/
│   ├── blog/
│   ├── calidad-academica/
│   ├── escuela/
│   ├── historias/
│   ├── industria-empleabilidad/
│   ├── landing/
│   ├── programas/
│   └── rutas/
├── services/       # api.ts
├── styles/         # global.css (design system)
└── lib/            # utils.ts
```

## Design System

### Paleta de colores

| Token | Color | Uso |
|:------|:------|:----|
| `bg-primary` | `#0A0A0A` | Fondo base (negro profundo) |
| `bg-secondary` | `#111111` | Superficies elevadas |
| `bg-tertiary` | `#1A1A1A` | Cards, inputs |
| `content` | `#F5F5F7` | Texto principal |
| `content-muted` | `#86868B` | Texto secundario |
| `brand` | `#1561F0` | Botones, acentos, hover |

### Utilidades CSS premium

| Clase | Efecto |
|:------|:-------|
| `.card-premium` | Card con top-light shine, hover lift y depth shadow |
| `.glass` | Superficie con backdrop-blur y borde sutil |
| `.spotlight` | Radial glow azul para efecto "shiny black" |
| `.text-gradient` | Texto con gradiente blanco a gris |
| `.btn-primary` | Boton con glow blur en hover |
| `.btn-secondary` | Boton outline con lift sutil |
| `.reveal` | Scroll-triggered fade-up (IntersectionObserver) |
| `.noise` | Textura SVG de ruido para profundidad |

## Comandos

| Comando | Accion |
|:--------|:-------|
| `npm install` | Instalar dependencias |
| `npm run dev` | Servidor local en `localhost:4321` |
| `npm run build` | Build de produccion en `./dist/` |
| `npm run preview` | Preview del build local |

## Deploy

El proyecto se despliega automaticamente en **AWS Amplify** al hacer push a la rama `main`. La configuracion esta en `amplify.yml`.
