import { storeToRefs } from 'pinia'
import { useFiltersStore } from '@/stores/filters'

export function useFilters() {
  const store = useFiltersStore()
  const { filters, hasActiveFilters, activeFiltersCount, apiQueryParams } = storeToRefs(store)

  return {
    filters,
    hasActiveFilters,
    activeFiltersCount,
    apiQueryParams,
    setPreset: store.setPreset,
    setDateRange: store.setDateRange,
    addCustomer: store.addCustomer,
    removeCustomer: store.removeCustomer,
    setCustomers: store.setCustomers,
    addRegion: store.addRegion,
    removeRegion: store.removeRegion,
    setRegions: store.setRegions,
    addProduct: store.addProduct,
    removeProduct: store.removeProduct,
    setProducts: store.setProducts,
    resetFilters: store.resetFilters,
    toggleCompareWithPrevious: store.toggleCompareWithPrevious,
    setCompareWithPrevious: store.setCompareWithPrevious,
    initFromStorage: store.initFromStorage,
  }
}
