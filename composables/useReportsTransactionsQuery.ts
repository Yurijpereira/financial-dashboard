import { computed, type Ref } from 'vue'
import type { ReportSortField, ReportSortOrder, ReportsTransactionsResponse } from '@/types/reports'
import { useFilters } from '@/composables/useFilters'

type UseReportsTransactionsQueryOptions = {
  page: Ref<number>
  pageSize: Ref<number>
  sortField: Ref<ReportSortField>
  sortOrder: Ref<ReportSortOrder>
  search: Ref<string>
  advancedQueryParams: Ref<Record<string, string>>
}

export function useReportsTransactionsQuery(options: UseReportsTransactionsQueryOptions) {
  const { apiQueryParams } = useFilters()

  const queryParams = computed(() => {
    const params: Record<string, string> = {
      ...apiQueryParams.value,
      ...options.advancedQueryParams.value,
      page: String(options.page.value),
      pageSize: String(options.pageSize.value),
      sortField: options.sortField.value,
      sortOrder: options.sortOrder.value,
    }

    if (options.search.value) {
      params.search = options.search.value
    }

    return params
  })

  const queryKey = computed(() => {
    return `reports-transactions-${JSON.stringify(queryParams.value)}`
  })

  const requestState = useFetch<ReportsTransactionsResponse>('/api/reports/transactions', {
    key: queryKey,
    query: queryParams,
    immediate: true,
    getCachedData: (key) => {
      return useNuxtApp().payload.data[key] ?? useNuxtApp().static.data[key]
    },
  })

  return {
    ...requestState,
    queryParams,
  }
}
