export function useFormatters() {
  function formatCurrencyBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    }).format(value)
  }

  function formatInteger(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 0,
    }).format(value)
  }

  function formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  function formatPercentage(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`
  }

  function formatDateTime(isoDate: string): string {
    const date = new Date(isoDate)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return {
    formatCurrencyBRL,
    formatInteger,
    formatNumber,
    formatPercentage,
    formatDateTime,
  }
}
