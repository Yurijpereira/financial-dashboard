import type { FinancialSummaryResponse } from '@/types/financial'
import { useFilters } from '@/composables/useFilters'
import { computed, onServerPrefetch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'

export function useFinancialSummaryQuery() {
  const { apiQueryParams } = useFilters()
  const queryClient = useQueryClient()
  const requestFetch = import.meta.server ? useRequestFetch() : $fetch

  const serializedParams = computed(() => {
    return JSON.stringify(apiQueryParams.value)
  })

  const queryKey = computed(() => {
    return ['financial-summary', serializedParams.value] as const
  })

  const queryFn = async (): Promise<FinancialSummaryResponse> => {
    return requestFetch<FinancialSummaryResponse>('/api/financial/summary', {
      query: apiQueryParams.value,
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

  const query = useQuery<FinancialSummaryResponse, Error>({
    queryKey,
    queryFn,
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
  }
}
