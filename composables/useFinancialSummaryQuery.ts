import { useQuery } from '@tanstack/vue-query'
import type { FinancialSummaryResponse } from '@/types/financial'

async function fetchFinancialSummary(): Promise<FinancialSummaryResponse> {
  return await $fetch('/api/financial/summary')
}

export function useFinancialSummaryQuery() {
  return useQuery({
    queryKey: ['financial-summary'],
    queryFn: fetchFinancialSummary,
  })
}
