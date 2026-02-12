import type { FinancialSummaryResponse } from '@/types/financial'
import { useFilters } from '@/composables/useFilters'

export function useFinancialSummaryQuery() {
  const { apiQueryParams } = useFilters()

  return useFetch<FinancialSummaryResponse>('/api/financial/summary', {
    key: 'financial-summary',
    query: apiQueryParams,
    watch: [apiQueryParams],
  })
}
