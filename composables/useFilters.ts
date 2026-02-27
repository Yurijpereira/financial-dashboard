import { ref, computed } from 'vue'
import type { DashboardFilters, DateRange, PeriodPreset } from '@/types/filters'
import { getDateRangeFromPreset, isValidDateRange } from '@/utils/dateHelpers'

const PERIOD_PRESETS: readonly PeriodPreset[] = ['today', '7days', '30days', '90days', 'mtd', 'ytd', 'custom']

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
  if (!value || typeof value !== 'object') {
    return false
  }

  const filters = value as Partial<DashboardFilters>

  return (
    !!filters.dateRange &&
    isValidDateRange(filters.dateRange as DateRange) &&
    typeof filters.preset === 'string' &&
    PERIOD_PRESETS.includes(filters.preset as PeriodPreset) &&
    isStringArray(filters.customers) &&
    isStringArray(filters.regions) &&
    isStringArray(filters.products) &&
    typeof filters.compareWithPrevious === 'boolean'
  )
}

const filters = ref<DashboardFilters>(createDefaultFilters())
let isInitialized = false

export function useFilters() {
  if (!isInitialized && import.meta.client) {
    import('./useFilters.client').then(({ loadFiltersFromStorage, setupFiltersStorageWatcher }) => {
      const stored = loadFiltersFromStorage()
      if (isValidStoredFilters(stored)) {
        filters.value = stored
      }
      
      setupFiltersStorageWatcher(() => filters.value)
    })
    isInitialized = true
  }

  function setPreset(preset: PeriodPreset): void {
    filters.value.preset = preset
    if (preset !== 'custom') {
      filters.value.dateRange = getDateRangeFromPreset(preset)
    }
  }

  function setDateRange(range: DateRange): void {
    if (!isValidDateRange(range)) {
      console.warn('Invalid date range:', range)
      return
    }

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

  const hasActiveFilters = computed(() => {
    return (
      filters.value.customers.length > 0 ||
      filters.value.regions.length > 0 ||
      filters.value.products.length > 0
    )
  })

  const activeFiltersCount = computed(() => {
    return (
      filters.value.customers.length +
      filters.value.regions.length +
      filters.value.products.length
    )
  })

  const apiQueryParams = computed(() => {
    const params: Record<string, string> = {
      startDate: filters.value.dateRange.start,
      endDate: filters.value.dateRange.end,
    }

    if (filters.value.compareWithPrevious) {
      params.compareWithPrevious = 'true'
    }

    if (filters.value.customers.length > 0) {
      params.customers = filters.value.customers.join(',')
    }

    if (filters.value.regions.length > 0) {
      params.regions = filters.value.regions.join(',')
    }

    if (filters.value.products.length > 0) {
      params.products = filters.value.products.join(',')
    }

    return params
  })

  return {
    filters: computed(() => filters.value),
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

    toggleCompareWithPrevious,
    setCompareWithPrevious,

    resetFilters,
  }
}
