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
  compareWithPrevious: boolean
}

export type FilterOption = {
  value: string
  label: string
}

export type SavedView = {
  id: string
  name: string
  filters: DashboardFilters
  createdAt: string
  updatedAt: string
}

export type SavedViewInput = {
  name: string
  filters: DashboardFilters
}
