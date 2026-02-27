import type { FinancialSummaryResponse } from '@/types/financial'
import { useFilters } from '@/composables/useFilters'
import { computed, watch } from 'vue'

export function useFinancialSummaryQuery() {
  const { apiQueryParams } = useFilters()

  const queryKey = computed(() => {
    const params = apiQueryParams.value
    return `financial-summary-${JSON.stringify(params)}`
  })

  return useFetch<FinancialSummaryResponse>('/api/financial/summary', {
    key: queryKey,
    query: apiQueryParams,
    immediate: true,
    getCachedData: (key) => {
      return useNuxtApp().payload.data[key] ?? useNuxtApp().static.data[key]
    },
  })
}
