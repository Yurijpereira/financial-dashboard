import { ref, computed } from 'vue'
import type { DashboardFilters, DateRange, PeriodPreset } from '@/types/filters'
import { getDateRangeFromPreset, isValidDateRange } from '@/utils/dateHelpers'

/**
 * Cria os filtros padrão
 */
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

// Estado global dos filtros
const filters = ref<DashboardFilters>(createDefaultFilters())
let isInitialized = false

/**
 * Composable para gerenciar os filtros do dashboard
 * Compartilha estado global entre componentes e persiste no localStorage
 */
export function useFilters() {
  // Inicializa os filtros do localStorage apenas uma vez (client-side)
  if (!isInitialized && process.client) {
    // Importação dinâmica do código client-only
    import('./useFilters.client').then(({ loadFiltersFromStorage, setupFiltersStorageWatcher }) => {
      const stored = loadFiltersFromStorage()
      if (stored && isValidDateRange(stored.dateRange)) {
        filters.value = stored
      }
      
      // Setup do watcher para localStorage
      setupFiltersStorageWatcher(() => filters.value)
    })
    isInitialized = true
  }

  /**
   * Atualiza o preset e recalcula o range de datas
   */
  function setPreset(preset: PeriodPreset): void {
    filters.value.preset = preset
    if (preset !== 'custom') {
      filters.value.dateRange = getDateRangeFromPreset(preset)
    }
  }

  /**
   * Define um range de datas customizado
   */
  function setDateRange(range: DateRange): void {
    if (!isValidDateRange(range)) {
      console.warn('Invalid date range:', range)
      return
    }

    filters.value.dateRange = range
    filters.value.preset = 'custom'
  }

  /**
   * Adiciona um cliente aos filtros
   */
  function addCustomer(customerId: string): void {
    if (!filters.value.customers.includes(customerId)) {
      filters.value.customers.push(customerId)
    }
  }

  /**
   * Remove um cliente dos filtros
   */
  function removeCustomer(customerId: string): void {
    filters.value.customers = filters.value.customers.filter((id) => id !== customerId)
  }

  /**
   * Define múltiplos clientes
   */
  function setCustomers(customerIds: string[]): void {
    filters.value.customers = [...customerIds]
  }

  /**
   * Adiciona uma região aos filtros
   */
  function addRegion(region: string): void {
    if (!filters.value.regions.includes(region)) {
      filters.value.regions.push(region)
    }
  }

  /**
   * Remove uma região dos filtros
   */
  function removeRegion(region: string): void {
    filters.value.regions = filters.value.regions.filter((r) => r !== region)
  }

  /**
   * Define múltiplas regiões
   */
  function setRegions(regions: string[]): void {
    filters.value.regions = [...regions]
  }

  /**
   * Adiciona um produto aos filtros
   */
  function addProduct(product: string): void {
    if (!filters.value.products.includes(product)) {
      filters.value.products.push(product)
    }
  }

  /**
   * Remove um produto dos filtros
   */
  function removeProduct(product: string): void {
    filters.value.products = filters.value.products.filter((p) => p !== product)
  }

  /**
   * Define múltiplos produtos
   */
  function setProducts(products: string[]): void {
    filters.value.products = [...products]
  }

  /**
   * Reseta todos os filtros para o padrão
   */
  function resetFilters(): void {
    filters.value = createDefaultFilters()
  }

  /**
   * Ativa/desativa comparação com período anterior
   */
  function toggleCompareWithPrevious(): void {
    filters.value.compareWithPrevious = !filters.value.compareWithPrevious
  }

  /**
   * Define se deve comparar com período anterior
   */
  function setCompareWithPrevious(value: boolean): void {
    filters.value.compareWithPrevious = value
  }

  /**
   * Verifica se há filtros ativos (além do dateRange)
   */
  const hasActiveFilters = computed(() => {
    return (
      filters.value.customers.length > 0 ||
      filters.value.regions.length > 0 ||
      filters.value.products.length > 0
    )
  })

  /**
   * Conta quantos filtros estão ativos
   */
  const activeFiltersCount = computed(() => {
    return (
      filters.value.customers.length +
      filters.value.regions.length +
      filters.value.products.length
    )
  })

  /**
   * Serializa os filtros para query params da API
   */
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
    // Estado
    filters: computed(() => filters.value),
    hasActiveFilters,
    activeFiltersCount,
    apiQueryParams,

    // Ações - Período
    setPreset,
    setDateRange,

    // Ações - Clientes
    addCustomer,
    removeCustomer,
    setCustomers,

    // Ações - Regiões
    addRegion,
    removeRegion,
    setRegions,

    // Ações - Produtos
    addProduct,
    removeProduct,
    setProducts,

    // Ações - Comparação
    toggleCompareWithPrevious,
    setCompareWithPrevious,

    // Ações - Geral
    resetFilters,
  }
}
