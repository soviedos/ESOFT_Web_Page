export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function formatFecha(fecha: Date | string): string {
  return new Date(fecha).toLocaleDateString('es-CR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
