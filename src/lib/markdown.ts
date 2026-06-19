import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

// GFM con saltos de línea simples → <br>. Sin IDs en headings ni mangle.
marked.setOptions({ gfm: true, breaks: true })

// Allowlist estricta: solo formato de texto. El HTML crudo del Markdown
// (incluido <script> o cualquier etiqueta no listada) se descarta.
const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'del',
    'blockquote', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4',
    'a', 'code', 'pre',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  // Los enlaces externos se abren en pestaña nueva con rel seguro.
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href ?? ''
      const externo = /^https?:\/\//i.test(href)
      return {
        tagName: 'a',
        attribs: externo
          ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
          : attribs,
      }
    },
  },
}

// Convierte Markdown a HTML sanitizado y seguro para inyectar con set:html.
export function renderMarkdown(md: string | null | undefined): string {
  if (!md) return ''
  const html = marked.parse(md, { async: false }) as string
  return sanitizeHtml(html, SANITIZE_OPTS)
}
