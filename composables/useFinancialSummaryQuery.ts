import type { FinancialSummaryResponse } from '@/types/financial'
import { useFilters } from '@/composables/useFilters'
import { computed, watch } from 'vue'

export function useFinancialSummaryQuery() {
  const { apiQueryParams } = useFilters()

  // Cria uma key única baseada nos params para evitar duplicatas
  const queryKey = computed(() => {
    const params = apiQueryParams.value
    return `financial-summary-${JSON.stringify(params)}`
  })

  return useFetch<FinancialSummaryResponse>('/api/financial/summary', {
    key: queryKey,
    query: apiQueryParams,
    // Desabilita watch automático para evitar loops
    immediate: true,
    // Usa getCachedData para evitar refetches desnecessários
    getCachedData: (key) => {
      return useNuxtApp().payload.data[key] ?? useNuxtApp().static.data[key]
    },
  })
}
