import type { DateRange, PeriodPreset } from '@/types/filters'

const TIME_SUFFIX = 'T00:00:00'

export function formatToISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatToDisplayDate(isoDate: string): string {
  const date = new Date(isoDate + TIME_SUFFIX)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function getToday(): string {
  return formatToISODate(new Date())
}

export function getDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatToISODate(date)
}

export function getMonthStart(): string {
  const date = new Date()
  date.setDate(1)
  return formatToISODate(date)
}

export function getYearStart(): string {
  const date = new Date()
  date.setMonth(0)
  date.setDate(1)
  return formatToISODate(date)
}

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

export function isValidISODate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') return false
  
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false

  const date = new Date(dateString + TIME_SUFFIX)
  return !isNaN(date.getTime())
}

export function isValidDateRange(range: DateRange): boolean {
  if (!range || typeof range !== 'object') {
    return false
  }
  
  if (!isValidISODate(range.start) || !isValidISODate(range.end)) {
    return false
  }

  const start = new Date(range.start + TIME_SUFFIX)
  const end = new Date(range.end + TIME_SUFFIX)

  return start <= end
}

export function getDaysDifference(start: string, end: string): number {
  const startDate = new Date(start + TIME_SUFFIX)
  const endDate = new Date(end + TIME_SUFFIX)
  const diffTime = endDate.getTime() - startDate.getTime()
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  return Math.ceil(diffTime / MS_PER_DAY)
}
