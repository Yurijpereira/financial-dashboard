export async function downloadExport(
  queryParams: Record<string, string>,
  format: 'csv' | 'pdf',
): Promise<void> {
  const params = new URLSearchParams({ ...queryParams, format })

  const blob = await $fetch<Blob>(`/api/reports/transactions/export?${params.toString()}`, {
    responseType: 'blob',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `relatorio-transacoes.${format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
