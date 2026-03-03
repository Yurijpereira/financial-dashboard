import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { DashboardFilters, DateRange, PeriodPreset } from '@/types/filters'
import { getDateRangeFromPreset, isValidDateRange } from '@/utils/dateHelpers'

const STORAGE_KEY = 'financial-dashboard-filters'

const PERIOD_PRESETS: readonly PeriodPreset[] = [
  'today', '7days', '30days', '90days', 'mtd', 'ytd', 'custom',
]

function createDefaultFilters(): DashboardFilters {
  return {
    dateRange: getDateRangeFromPreset('30days'),
    preset: '30days',
    customers: [],
    regions: [],
    products: [],
    compareWithPrevious: false,
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isValidStoredFilters(value: unknown): value is DashboardFilters {
  if (!value || typeof value !== 'object') return false
  const f = value as Partial<DashboardFilters>
  return (
    !!f.dateRange &&
    isValidDateRange(f.dateRange as DateRange) &&
    typeof f.preset === 'string' &&
    PERIOD_PRESETS.includes(f.preset as PeriodPreset) &&
    isStringArray(f.customers) &&
    isStringArray(f.regions) &&
    isStringArray(f.products) &&
    typeof f.compareWithPrevious === 'boolean'
  )
}

export const useFiltersStore = defineStore('filters', () => {
  const filters = ref<DashboardFilters>(createDefaultFilters())

  if (import.meta.client) {
    watch(filters, (val) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      } catch {}
    }, { deep: true, flush: 'post' })
  }

  function initFromStorage(): void {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (isValidStoredFilters(parsed)) filters.value = parsed
      }
    } catch {}
  }

  function setPreset(preset: PeriodPreset): void {
    filters.value.preset = preset
    if (preset !== 'custom') {
      filters.value.dateRange = getDateRangeFromPreset(preset)
    }
  }

  function setDateRange(range: DateRange): void {
    if (!isValidDateRange(range)) return
    filters.value.dateRange = range
    filters.value.preset = 'custom'
  }

  function addCustomer(customerId: string): void {
    if (!filters.value.customers.includes(customerId)) {
      filters.value.customers.push(customerId)
    }
  }

  function removeCustomer(customerId: string): void {
    filters.value.customers = filters.value.customers.filter((id) => id !== customerId)
  }

  function setCustomers(customerIds: string[]): void {
    filters.value.customers = [...customerIds]
  }

  function addRegion(region: string): void {
    if (!filters.value.regions.includes(region)) {
      filters.value.regions.push(region)
    }
  }

  function removeRegion(region: string): void {
    filters.value.regions = filters.value.regions.filter((r) => r !== region)
  }

  function setRegions(regions: string[]): void {
    filters.value.regions = [...regions]
  }

  function addProduct(product: string): void {
    if (!filters.value.products.includes(product)) {
      filters.value.products.push(product)
    }
  }

  function removeProduct(product: string): void {
    filters.value.products = filters.value.products.filter((p) => p !== product)
  }

  function setProducts(products: string[]): void {
    filters.value.products = [...products]
  }

  function resetFilters(): void {
    filters.value = createDefaultFilters()
  }

  function toggleCompareWithPrevious(): void {
    filters.value.compareWithPrevious = !filters.value.compareWithPrevious
  }

  function setCompareWithPrevious(value: boolean): void {
    filters.value.compareWithPrevious = value
  }

  const hasActiveFilters = computed(() =>
    filters.value.customers.length > 0 ||
    filters.value.regions.length > 0 ||
    filters.value.products.length > 0,
  )

  const activeFiltersCount = computed(() =>
    filters.value.customers.length +
    filters.value.regions.length +
    filters.value.products.length,
  )

  const apiQueryParams = computed(() => {
    const params: Record<string, string> = {
      startDate: filters.value.dateRange.start,
      endDate: filters.value.dateRange.end,
    }

    if (filters.value.compareWithPrevious) params.compareWithPrevious = 'true'
    if (filters.value.customers.length > 0) params.customers = filters.value.customers.join(',')
    if (filters.value.regions.length > 0) params.regions = filters.value.regions.join(',')
    if (filters.value.products.length > 0) params.products = filters.value.products.join(',')

    return params
  })

  return {
    filters,
    hasActiveFilters,
    activeFiltersCount,
    apiQueryParams,
    setPreset,
    setDateRange,
    addCustomer,
    removeCustomer,
    setCustomers,
    addRegion,
    removeRegion,
    setRegions,
    addProduct,
    removeProduct,
    setProducts,
    resetFilters,
    toggleCompareWithPrevious,
    setCompareWithPrevious,
    initFromStorage,
  }
})
