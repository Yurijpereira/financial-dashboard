export type DateRange = {
  start: string // ISO date string
  end: string // ISO date string
}

export type PeriodPreset = 'today' | '7days' | '30days' | '90days' | 'mtd' | 'ytd' | 'custom'

export type DashboardFilters = {
  dateRange: DateRange
  preset: PeriodPreset
  customers: string[]
  regions: string[]
  products: string[]
}

export type FilterOption = {
  value: string
  label: string
}
