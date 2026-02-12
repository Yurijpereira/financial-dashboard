import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { DashboardFilters } from '@/types/filters'
import { isValidDateRange } from '@/utils/dateHelpers'
import { useFilters } from '@/composables/useFilters'

/**
 * Serializa filtros para query params da URL
 */
function serializeFiltersToQuery(filters: DashboardFilters): Record<string, string> {
  const query: Record<string, string> = {
    start: filters.dateRange.start,
    end: filters.dateRange.end,
    preset: filters.preset,
  }

  if (filters.customers.length > 0) {
    query.customers = filters.customers.join(',')
  }

  if (filters.regions.length > 0) {
    query.regions = filters.regions.join(',')
  }

  if (filters.products.length > 0) {
    query.products = filters.products.join(',')
  }

  if (filters.compareWithPrevious) {
    query.compare = '1'
  }

  return query
}

/**
 * Deserializa query params da URL para filtros
 */
function deserializeQueryToFilters(query: Record<string, any>): Partial<DashboardFilters> | null {
  try {
    const filters: Partial<DashboardFilters> = {}

    // Date range
    if (query.start && query.end) {
      const dateRange = { start: query.start as string, end: query.end as string }
      
      if (isValidDateRange(dateRange)) {
        filters.dateRange = dateRange
      }
    }

    // Preset
    if (query.preset) {
      filters.preset = query.preset as DashboardFilters['preset']
    }

    // Lists
    if (query.customers) {
      filters.customers = (query.customers as string).split(',').filter(Boolean)
    }

    if (query.regions) {
      filters.regions = (query.regions as string).split(',').filter(Boolean)
    }

    if (query.products) {
      filters.products = (query.products as string).split(',').filter(Boolean)
    }

    if (query.compare) {
      filters.compareWithPrevious = query.compare === '1'
    }

    return filters
  } catch (error) {
    console.warn('Failed to deserialize query params:', error)
    return null
  }
}

/**
 * Composable para sincronizar filtros com URL
 */
export function useFiltersUrlSync() {
  // Guards para garantir que só roda no client
  if (!import.meta.client) {
    return {
      syncFiltersToUrl: () => {},
      loadFiltersFromUrl: () => null,
      getShareableUrl: () => '',
      copyShareableUrl: async () => false,
      watchFiltersForUrlSync: () => {},
    }
  }

  const router = useRouter()
  const route = useRoute()

  /**
   * Atualiza a URL com os filtros atuais (sem navegar)
   */
  function syncFiltersToUrl(filters: DashboardFilters, replace = true): void {
    const query = serializeFiltersToQuery(filters)

    const method = replace ? router.replace : router.push
    
    method({
      query,
    }).catch((err) => {
      // Silencia erro de navegação duplicada
      if (err.name !== 'NavigationDuplicated') {
        console.warn('Failed to sync filters to URL:', err)
      }
    })
  }

  /**
   * Carrega filtros da URL atual e aplica ao estado global
   */
  function loadFiltersFromUrl(): Partial<DashboardFilters> | null {
    const urlFilters = deserializeQueryToFilters(route.query)
    if (urlFilters && Object.keys(urlFilters).length > 0) {
      // Aplica os filtros da URL ao estado global
      const { setDateRange, setPreset, setCustomers, setRegions, setProducts, setCompareWithPrevious, filters } = useFilters()
      
      if (urlFilters.dateRange) {
        setDateRange(urlFilters.dateRange)
      }
      if (urlFilters.preset) {
        setPreset(urlFilters.preset)
      }
      if (urlFilters.customers) {
        setCustomers(urlFilters.customers)
      }
      if (urlFilters.regions) {
        setRegions(urlFilters.regions)
      }
      if (urlFilters.products) {
        setProducts(urlFilters.products)
      }
      if (urlFilters.compareWithPrevious !== undefined) {
        setCompareWithPrevious(urlFilters.compareWithPrevious)
      }
    }
    return urlFilters
  }

  /**
   * Gera uma URL compartilhável com os filtros atuais
   */
  function getShareableUrl(filters: DashboardFilters): string {
    const query = serializeFiltersToQuery(filters)
    const queryString = new URLSearchParams(query).toString()
    
    if (typeof window !== 'undefined') {
      const { protocol, host, pathname } = window.location
      return `${protocol}//${host}${pathname}?${queryString}`
    }

    return `?${queryString}`
  }

  /**
   * Copia a URL compartilhável para a área de transferência
   */
  async function copyShareableUrl(filters: DashboardFilters): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return false
    }

    try {
      const url = getShareableUrl(filters)
      await navigator.clipboard.writeText(url)
      return true
    } catch (error) {
      console.warn('Failed to copy URL to clipboard:', error)
      return false
    }
  }

  /**
   * Observa mudanças nos filtros e atualiza a URL automaticamente
   */
  function watchFiltersForUrlSync(
    getFilters: () => DashboardFilters,
    options: { immediate?: boolean; debounce?: number } = {}
  ): void {
    const { immediate = false, debounce = 300 } = options

    let timeoutId: NodeJS.Timeout | null = null

    watch(
      getFilters,
      (filters) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => {
          syncFiltersToUrl(filters, true)
        }, debounce)
      },
      { immediate, deep: true, flush: 'post' }
    )
  }

  return {
    syncFiltersToUrl,
    loadFiltersFromUrl,
    getShareableUrl,
    copyShareableUrl,
    watchFiltersForUrlSync,
  }
}
