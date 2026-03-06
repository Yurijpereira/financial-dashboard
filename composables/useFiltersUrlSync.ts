import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { DashboardFilters } from '@/types/filters'
import { isValidDateRange } from '@/utils/dateHelpers'
import { useFilters } from '@/composables/useFilters'

function normalizeQueryValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(',')
  }

  return value == null ? '' : String(value)
}

function hasSameQuery(
  currentQuery: Record<string, unknown>,
  nextQuery: Record<string, string>,
): boolean {
  const currentKeys = Object.keys(currentQuery).sort()
  const nextKeys = Object.keys(nextQuery).sort()

  if (currentKeys.length !== nextKeys.length) {
    return false
  }

  for (let index = 0; index < nextKeys.length; index += 1) {
    const key = nextKeys[index]
    if (!key || currentKeys[index] !== key) {
      return false
    }

    if (normalizeQueryValue(currentQuery[key]) !== nextQuery[key]) {
      return false
    }
  }

  return true
}

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

function deserializeQueryToFilters(query: Record<string, any>): Partial<DashboardFilters> | null {
  try {
    const filters: Partial<DashboardFilters> = {}

    if (query.start && query.end) {
      const dateRange = { start: query.start as string, end: query.end as string }

      if (isValidDateRange(dateRange)) {
        filters.dateRange = dateRange
      }
    }

    if (query.preset) {
      filters.preset = query.preset as DashboardFilters['preset']
    }

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

export function useFiltersUrlSync() {
  if (!import.meta.client) {
    return {
      syncFiltersToUrl: () => {},
      loadFiltersFromUrl: () => null,
      getShareableUrl: () => '',
      copyShareableUrl: async () => false,
      watchFiltersForUrlSync: () => {},
    }
  }

  let router: ReturnType<typeof useRouter> | null = null
  let route: ReturnType<typeof useRoute> | null = null

  if (import.meta.client) {
    router = useRouter()
    route = useRoute()
  }

  function syncFiltersToUrl(filters: DashboardFilters, replace = true): void {
    if (!router || !route) return

    const query = serializeFiltersToQuery(filters)
    if (hasSameQuery(route.query as Record<string, unknown>, query)) {
      return
    }

    const method = replace ? router.replace : router.push

    method({
      query,
    }).catch((err) => {
      if (err.name !== 'NavigationDuplicated') {
        console.warn('Failed to sync filters to URL:', err)
      }
    })
  }

  function loadFiltersFromUrl(): Partial<DashboardFilters> | null {
    if (!route) return null

    const urlFilters = deserializeQueryToFilters(route.query)
    if (urlFilters && Object.keys(urlFilters).length > 0) {
      const {
        setDateRange,
        setPreset,
        setCustomers,
        setRegions,
        setProducts,
        setCompareWithPrevious,
        filters,
      } = useFilters()

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

  function getShareableUrl(filters: DashboardFilters): string {
    const query = serializeFiltersToQuery(filters)
    const queryString = new URLSearchParams(query).toString()

    if (typeof window !== 'undefined') {
      const { protocol, host, pathname } = window.location
      return `${protocol}//${host}${pathname}?${queryString}`
    }

    return `?${queryString}`
  }

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

  function watchFiltersForUrlSync(
    getFilters: () => DashboardFilters,
    options: { immediate?: boolean; debounce?: number } = {},
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
      { immediate, deep: true, flush: 'post' },
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
