import { ref, computed, watch } from 'vue'
import type { DashboardFilters, DateRange, PeriodPreset } from '@/types/filters'
import { getDateRangeFromPreset, isValidDateRange } from '@/utils/dateHelpers'

const STORAGE_KEY = 'financial-dashboard-filters'

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
  }
}

/**
 * Carrega filtros do localStorage
 */
function loadFiltersFromStorage(): DashboardFilters | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const parsed = JSON.parse(stored) as DashboardFilters

    // Valida o range de datas
    if (!isValidDateRange(parsed.dateRange)) {
      return null
    }

    return parsed
  } catch (error) {
    console.warn('Failed to load filters from localStorage:', error)
    return null
  }
}

/**
 * Salva filtros no localStorage
 */
function saveFiltersToStorage(filters: DashboardFilters): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  } catch (error) {
    console.warn('Failed to save filters to localStorage:', error)
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
  if (!isInitialized && typeof window !== 'undefined') {
    const stored = loadFiltersFromStorage()
    if (stored) {
      filters.value = stored
    }
    isInitialized = true

    // Salva automaticamente quando os filtros mudam
    watch(
      filters,
      (newFilters) => {
        saveFiltersToStorage(newFilters)
      },
      { deep: true }
    )
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

    // Ações - Geral
    resetFilters,
  }
}
