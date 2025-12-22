export type FinancialKpiMetric = {
  value: number
  variationPercentage: number | null
}

export type FinancialSummaryResponse = {
  kpis: {
    revenue: FinancialKpiMetric
    billedOrders: FinancialKpiMetric
    averageTicket: FinancialKpiMetric
  }
  salesSeries: Array<{ date: string; value: number }>
  topCustomers: Array<{ id: string; name: string; revenue: number; orders: number }>
}
