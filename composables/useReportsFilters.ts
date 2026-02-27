import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { ReportsAdvancedFilters } from '@/types/reports'

const SEARCH_DEBOUNCE_MS = 350

function createDefaultAdvancedFilters(): ReportsAdvancedFilters {
  return {
    statuses: [],
    categories: [],
    paymentMethods: [],
    minAmount: null,
    maxAmount: null,
  }
}

function cloneFilters(filters: ReportsAdvancedFilters): ReportsAdvancedFilters {
  return {
    statuses: [...filters.statuses],
    categories: [...filters.categories],
    paymentMethods: [...filters.paymentMethods],
    minAmount: filters.minAmount,
    maxAmount: filters.maxAmount,
  }
}

export function useReportsFilters() {
  const advancedFilters = ref<ReportsAdvancedFilters>(createDefaultAdvancedFilters())
  const searchInput = ref('')
  const debouncedSearch = ref('')
  let searchTimer: ReturnType<typeof setTimeout> | null = null

  watch(searchInput, (value) => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }

    searchTimer = setTimeout(() => {
      debouncedSearch.value = value.trim()
    }, SEARCH_DEBOUNCE_MS)
  })

  onBeforeUnmount(() => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
  })

  const hasActiveAdvancedFilters = computed(() => {
    return (
      advancedFilters.value.statuses.length > 0 ||
      advancedFilters.value.categories.length > 0 ||
      advancedFilters.value.paymentMethods.length > 0 ||
      advancedFilters.value.minAmount !== null ||
      advancedFilters.value.maxAmount !== null
    )
  })

  const apiQueryParams = computed(() => {
    const params: Record<string, string> = {}
    const filters = advancedFilters.value

    if (filters.statuses.length > 0) {
      params.statuses = filters.statuses.join(',')
    }

    if (filters.categories.length > 0) {
      params.categories = filters.categories.join(',')
    }

    if (filters.paymentMethods.length > 0) {
      params.paymentMethods = filters.paymentMethods.join(',')
    }

    if (filters.minAmount !== null) {
      params.minAmount = String(filters.minAmount)
    }

    if (filters.maxAmount !== null) {
      params.maxAmount = String(filters.maxAmount)
    }

    return params
  })

  function setAdvancedFilters(nextFilters: ReportsAdvancedFilters): void {
    advancedFilters.value = cloneFilters(nextFilters)
  }

  function updateAdvancedFilters(patch: Partial<ReportsAdvancedFilters>): void {
    advancedFilters.value = {
      ...advancedFilters.value,
      ...patch,
    }
  }

  function resetAdvancedFilters(): void {
    advancedFilters.value = createDefaultAdvancedFilters()
    searchInput.value = ''
    debouncedSearch.value = ''
  }

  return {
    advancedFilters: computed(() => advancedFilters.value),
    searchInput,
    debouncedSearch,
    hasActiveAdvancedFilters,
    apiQueryParams,
    setAdvancedFilters,
    updateAdvancedFilters,
    resetAdvancedFilters,
  }
}
