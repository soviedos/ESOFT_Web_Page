# Guía de contribución — ESOFT Web

Esta guía describe el proceso y las convenciones para contribuir al sitio web institucional de ESOFT.

---

## Tabla de contenidos

1. [Entorno de desarrollo](#entorno-de-desarrollo)
2. [Flujo de trabajo Git](#flujo-de-trabajo-git)
3. [Convenciones de commits](#convenciones-de-commits)
4. [Convenciones de código](#convenciones-de-código)
5. [Agregar o modificar páginas](#agregar-o-modificar-páginas)
6. [Modificar el design system](#modificar-el-design-system)
7. [Checklist antes de hacer push](#checklist-antes-de-hacer-push)

---

## Entorno de desarrollo

### Requisitos

- **Node.js** ≥ 22.12 — verificar con `node -v`
- **npm** ≥ 10 — verificar con `npm -v`
- Editor recomendado: **VS Code** con extensión oficial de Astro

### Configuración inicial

```bash
git clone https://github.com/soviedos/ESOFT_Web_Page.git
cd ESOFT_Web_Page
npm install
npm run dev
```

El servidor de desarrollo se inicia en `http://localhost:4321` con Hot Module Replacement activo.

---

## Flujo de trabajo Git

```
main (producción) ← único branch de deploy
```

Este repositorio sigue un flujo simplificado sobre `main`:

1. Hacer los cambios localmente
2. Verificar el build: `npm run build`
3. Hacer commit con mensaje convencional
4. Push a `main` y desplegar con Docker Compose (reconstruir la imagen de la app: `docker compose up -d --build app`)

> **No usar `git push --force` sobre `main` bajo ninguna circunstancia.**

---

## Convenciones de commits

Se sigue el estándar [Conventional Commits](https://www.conventionalcommits.org/).

### Formato

```
type(scope): descripción concisa en imperativo

[cuerpo opcional]

[footer opcional]
```

### Tipos permitidos

| Tipo | Cuándo usarlo |
|:-----|:-------------|
| `feat` | Nueva funcionalidad, nueva página o nuevo contenido |
| `fix` | Corrección de bug, dato incorrecto o comportamiento roto |
| `docs` | Cambios exclusivamente en documentación (README, CHANGELOG) |
| `style` | Cambios visuales sin impacto funcional (colores, espaciado) |
| `refactor` | Reestructura de código sin cambio de comportamiento |
| `perf` | Mejora de rendimiento |
| `chore` | Mantenimiento (deps, config, build) |

### Scopes sugeridos

`hero`, `nav`, `footer`, `terminal`, `programas`, `bisoft`, `misia`, `misad`, `paths`, `rutas`, `admision`, `stats`, `esoft`, `content`, `animation`, `ui`, `layout`, `readme`

### Ejemplos

```bash
feat(bisoft): add 2025 curriculum with 9 cuatrimestres and elective courses
fix(terminal): use is:global styles so JS-created elements are visible
docs(readme): full rewrite with program catalog and design system reference
style(hero): increase landing logos from 110px to 180px (desktop)
fix(stats): correct modality from Presencial to Virtual en vivo on MISIA and MISAD
```

---

## Convenciones de código

### General

- **Sin comentarios de código** salvo que el *porqué* sea genuinamente no obvio
- **Sin abstracciones prematuras** — repetir código es preferible a una abstracción que no aporta claridad
- **Sin manejo de errores para escenarios imposibles** — confiar en las garantías de Astro y Tailwind
- **Sin feature flags ni shims de retrocompatibilidad** — cambiar el código directamente

### Componentes Astro

- Los scripts que usan `document.createElement` **deben** declarar `<style is:global>` en vez de `<style>`, ya que los estilos con scope de Astro no alcanzan a los elementos creados en JavaScript en tiempo de ejecución
- Las props de los componentes se desestructuran en el frontmatter (`---`)
- Preferir `class:list` sobre concatenación de strings para clases condicionales

```astro
---
const { title, href, icon } = Astro.props;
---
<a href={href} class:list={['card-premium', href && 'cursor-pointer']}>
  {title}
</a>
```

### CSS y Tailwind

- Los tokens de diseño se definen en `@theme` en `global.css`, no como variables CSS sueltas
- Preferir tokens semánticos (`text-content-secondary`) sobre colores directos (`text-slate-500`)
- Si un componente requiere estilos que no están en el design system, agregarlos en `global.css` con una clase semántica — no usar `style=""` inline salvo para valores dinámicos
- Los CTAs ("Solicitar información") usan magenta de marca: `bg-accent2` con `hover:bg-accent-hover` (tokens en `@theme`); nunca naranja ni `hover:bg-orange-*`

### Paleta de colores — reglas de uso

| Contexto | Color correcto |
|:---------|:--------------|
| Todos los botones "Solicitar información" | `bg-accent2 text-white` |
| Links y acentos de marca | `text-brand` / `text-brand-label` |
| Texto principal | `text-content` |
| Texto descriptivo | `text-content-secondary` |
| Captions / metadata | `text-content-muted` |
| Fondos de sección | `bg-bg-primary` / `bg-bg-secondary` alternados |

### Reveal stagger

Si un grid usa `.reveal-stagger` con más de 9 hijos, agregar las reglas `nth-child` necesarias al final del bloque correspondiente en `global.css`:

```css
.reveal-stagger.visible > *:nth-child(10) { transition-delay: 0.63s; opacity: 1; transform: translateY(0); }
.reveal-stagger.visible > *:nth-child(11) { transition-delay: 0.70s; opacity: 1; transform: translateY(0); }
```

---

## Agregar o modificar páginas

### Nueva página

1. Crear el archivo `.astro` en la carpeta correcta dentro de `src/pages/`
2. Importar y usar el layout `Base.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
---

<Base title="Título de la página" description="Meta description (max 160 chars).">
  <!-- Contenido -->
</Base>
```

3. Seguir la estructura de secciones del resto de páginas:
   - `py-16 md:py-24 px-6` como padding estándar de sección
   - `max-w-[1060px] mx-auto` para el contenedor interno
   - Alternar `var(--color-bg-primary)` y `var(--color-bg-secondary)` entre secciones

4. Agregar el link a la nueva página en `Nav.astro` y/o `Footer.astro` si corresponde
5. Agregar la Card o link en `programas/index.astro` si es un programa académico

### Modificar contenido existente

- El contenido académico debe estar alineado con los documentos oficiales de la Universidad CENFOTEC
- Los datos numéricos (créditos, horas, cuatrimestres) deben coincidir con los planes de estudio aprobados
- Los datos de empleabilidad provienen de `olap.conare.ac.cr` (Observatorio Laboral de Profesiones, CONARE)

---

## Modificar el design system

### Agregar un color

En `src/styles/global.css`, dentro de `@theme`:

```css
@theme {
  --color-nuevo-token: #valor;
}
```

Luego está disponible como clase Tailwind: `bg-nuevo-token`, `text-nuevo-token`, etc.

### Agregar un componente CSS

En `global.css`, después de los componentes existentes:

```css
/* ── Nombre del componente ─── */
.mi-componente {
  /* propiedades */
}
```

### Agregar un ícono al componente Card

En `src/components/Card.astro`, agregar la clave al objeto `iconMap`:

```ts
const iconMap: Record<string, string> = {
  // ...existentes...
  nuevo: 'M... (SVG path data de HeroIcons)',
};
```

Uso: `<Card title="..." description="..." href="..." icon="nuevo" />`

---

## Checklist antes de hacer push

```
☐ npm run build — compila sin errores ni warnings de TypeScript
☐ npm run preview — el sitio se ve correcto en el build local
☐ Los botones "Solicitar información" son naranja (bg-accent2)
☐ Las modalidades dicen "Virtual en vivo" (no "Presencial")
☐ Los datos académicos son correctos (créditos, horas, cuatrimestres)
☐ El mensaje de commit sigue Conventional Commits
☐ No se han commiteado archivos .env, credenciales ni binarios grandes
```
