/**
 * Combina class names condicionalmente (alternativa ligera a clsx).
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formatea una fecha en español.
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('es', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}
