import type { DateRange, PeriodPreset } from '@/types/filters'

/**
 * Formata uma data para o padrão ISO (YYYY-MM-DD)
 */
export function formatToISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formata uma data para exibição (DD/MM/YYYY)
 */
export function formatToDisplayDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00')
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Retorna a data de hoje em formato ISO
 */
export function getToday(): string {
  return formatToISODate(new Date())
}

/**
 * Retorna a data de X dias atrás
 */
export function getDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatToISODate(date)
}

/**
 * Retorna o primeiro dia do mês atual (Month to Date)
 */
export function getMonthStart(): string {
  const date = new Date()
  date.setDate(1)
  return formatToISODate(date)
}

/**
 * Retorna o primeiro dia do ano atual (Year to Date)
 */
export function getYearStart(): string {
  const date = new Date()
  date.setMonth(0)
  date.setDate(1)
  return formatToISODate(date)
}

/**
 * Calcula o range de datas baseado no preset
 */
export function getDateRangeFromPreset(preset: PeriodPreset): DateRange {
  const today = getToday()

  switch (preset) {
    case 'today':
      return { start: today, end: today }

    case '7days':
      return { start: getDaysAgo(6), end: today }

    case '30days':
      return { start: getDaysAgo(29), end: today }

    case '90days':
      return { start: getDaysAgo(89), end: today }

    case 'mtd':
      return { start: getMonthStart(), end: today }

    case 'ytd':
      return { start: getYearStart(), end: today }

    case 'custom':
    default:
      return { start: getDaysAgo(29), end: today }
  }
}

/**
 * Valida se uma data está no formato ISO válido
 */
export function isValidISODate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false

  const date = new Date(dateString + 'T00:00:00')
  return !isNaN(date.getTime())
}

/**
 * Valida se um range de datas é válido
 */
export function isValidDateRange(range: DateRange): boolean {
  if (!isValidISODate(range.start) || !isValidISODate(range.end)) {
    return false
  }

  const start = new Date(range.start + 'T00:00:00')
  const end = new Date(range.end + 'T00:00:00')

  return start <= end
}

/**
 * Calcula a diferença em dias entre duas datas
 */
export function getDaysDifference(start: string, end: string): number {
  const startDate = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')
  const diffTime = endDate.getTime() - startDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
