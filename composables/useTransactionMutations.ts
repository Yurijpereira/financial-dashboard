import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { TransactionFormData, TransactionResponse } from '@/types/reports'

export function useTransactionMutations() {
  const queryClient = useQueryClient()

  function invalidateTransactions(): Promise<void> {
    return queryClient.invalidateQueries({ queryKey: ['reports-transactions'] })
  }

  const createMutation = useMutation<TransactionResponse, Error, TransactionFormData>({
    mutationFn: (data) =>
      $fetch<TransactionResponse>('/api/reports/transactions', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => invalidateTransactions(),
  })

  const updateMutation = useMutation<
    TransactionResponse,
    Error,
    { id: string; data: TransactionFormData }
  >({
    mutationFn: ({ id, data }) =>
      $fetch<TransactionResponse>(`/api/reports/transactions/${id}`, {
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => invalidateTransactions(),
  })

  const deleteMutation = useMutation<null, Error, string>({
    mutationFn: (id) =>
      $fetch<null>(`/api/reports/transactions/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => invalidateTransactions(),
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  }
}
