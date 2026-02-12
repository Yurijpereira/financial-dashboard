/**
 * Formatadores seguros para SSR (server/client)
 * Versões simplificadas que funcionam em ambos os ambientes
 */

/**
 * Formata números para moeda BRL (versão SSR-safe)
 */
export function formatCurrencyBRLSimple(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

/**
 * Formata números inteiros (versão SSR-safe)
 */
export function formatIntegerSimple(value: number): string {
  return Math.round(value).toString()
}

/**
 * Formata números (versão SSR-safe)
 */
export function formatNumberSimple(value: number): string {
  return value.toString()
}

/**
 * Formata percentuais
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

/**
 * Hook para usar formatadores apropriados baseado no ambiente
 */
export function useFormatters() {
  if (process.client) {
    // No cliente, importa os formatadores mais robustos
    return import('./formatters.client').then(m => ({
      formatCurrency: m.formatCurrencyBRL,
      formatInteger: m.formatInteger,
      formatNumber: m.formatNumber,
      formatPercentage: m.formatPercentage,
      formatDateTime: m.formatDateTime,
    }))
  }
  
  // No servidor, usa as versões simples
  return Promise.resolve({
    formatCurrency: formatCurrencyBRLSimple,
    formatInteger: formatIntegerSimple,
    formatNumber: formatNumberSimple,
    formatPercentage,
    formatDateTime: (date: string) => date,
  })
}
