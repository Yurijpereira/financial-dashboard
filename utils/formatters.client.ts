/**
 * Formatadores que dependem de Intl (client-only)
 * Estes formatadores NÃO devem ser usados no servidor
 */

/**
 * Formata números para moeda BRL
 */
export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formata números inteiros
 */
export function formatInteger(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formata números com locale pt-BR
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR')
}

/**
 * Formata percentuais
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

/**
 * Formata data para exibição
 */
export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
