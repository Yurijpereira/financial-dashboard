import { computed, type Ref } from 'vue'
import { onServerPrefetch } from 'vue'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/vue-query'
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
  const queryClient = useQueryClient()
  const requestFetch = import.meta.server ? useRequestFetch() : $fetch

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

  const serializedQueryParams = computed(() => {
    return JSON.stringify(queryParams.value)
  })

  const queryKey = computed(() => {
    return ['reports-transactions', serializedQueryParams.value] as const
  })

  const queryFn = async (): Promise<ReportsTransactionsResponse> => {
    return requestFetch<ReportsTransactionsResponse>('/api/reports/transactions', {
      query: queryParams.value,
    })
  }

  if (import.meta.server) {
    onServerPrefetch(async () => {
      await queryClient.prefetchQuery({
        queryKey: queryKey.value,
        queryFn,
      })
    })
  }

  const query = useQuery<ReportsTransactionsResponse, Error>({
    queryKey,
    queryFn,
    placeholderData: keepPreviousData,
  })

  const pending = computed(() => {
    return query.isPending.value
  })

  return {
    data: query.data,
    pending,
    isFetching: query.isFetching,
    error: query.error,
    refresh: query.refetch,
    queryParams,
  }
}
