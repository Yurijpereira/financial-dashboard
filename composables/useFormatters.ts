export function useFormatters() {
  function formatInteger(value: number): string {
    return Math.round(value)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  function formatCurrencyBRL(value: number): string {
    const [intPart, decPart] = value.toFixed(2).split('.')
    const intFormatted = (intPart ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `R$\u00a0${intFormatted},${decPart ?? '00'}`
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
    formatPercentage,
    formatDateTime,
  }
}
