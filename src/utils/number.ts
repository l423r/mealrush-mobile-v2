// Utility number/formatting helpers used across analytics UI

export function formatIntegerRu(n: number | undefined | null): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('ru-RU').format(Math.round(n));
}
