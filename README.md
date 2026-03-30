# ESOFT — Escuela de Ingeniería de Software

Sitio web de la Escuela de Ingeniería de Software (ESOFT) de la Universidad CENFOTEC, Costa Rica.

## Stack

- **Astro** v6 — Generador de sitios estáticos
- **Tailwind CSS** v4 — Utility-first CSS con design tokens personalizados
- **Inter** — Tipografía (Google Fonts)

## Estructura

```
src/
├── components/     # Nav, Footer, Card
├── layouts/        # Base.astro (shell HTML)
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
├── services/       # api.ts
├── styles/         # global.css (design tokens)
└── lib/            # utils.ts
```

## Paleta de colores

| Token | Color | Uso |
|:------|:------|:----|
| `bg-primary` | `#131313` | Fondo principal |
| `bg-secondary` | `#2B2B2B` | Superficies, cards |
| `content-muted` | `#86868B` | Texto secundario, bordes |
| `brand` | `#1561F0` | Botones, acentos, interacción |

## Comandos

| Comando | Acción |
|:--------|:-------|
| `npm install` | Instalar dependencias |
| `npm run dev` | Servidor local en `localhost:4321` |
| `npm run build` | Build de producción en `./dist/` |
| `npm run preview` | Preview del build local |
