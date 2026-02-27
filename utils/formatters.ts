
export function formatCurrencyBRLSimple(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

export function formatIntegerSimple(value: number): string {
  return Math.round(value).toString()
}

export function formatNumberSimple(value: number): string {
  return value.toString()
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function useFormatters() {
  if (import.meta.client) {
    return import('./formatters.client').then(m => ({
      formatCurrency: m.formatCurrencyBRL,
      formatInteger: m.formatInteger,
      formatNumber: m.formatNumber,
      formatPercentage: m.formatPercentageClient,
      formatDateTime: m.formatDateTime,
    }))
  }
  
  return Promise.resolve({
    formatCurrency: formatCurrencyBRLSimple,
    formatInteger: formatIntegerSimple,
    formatNumber: formatNumberSimple,
    formatPercentage,
    formatDateTime: (date: string) => date,
  })
}
