export type FinancialKpiMetric = {
  value: number
  variationPercentage: number | null
  previousValue?: number
}

export type SalesDataPoint = {
  date: string
  value: number
  previousValue?: number
}

export type CustomerData = {
  id: string
  name: string
  revenue: number
  orders: number
}

export type MonthlyComparisonData = {
  month: string
  revenue: number
  orders: number
  target?: number
}

export type ConversionMetric = {
  label: string
  value: number
  total: number
  previousValue?: number
}

export type FinancialSummaryResponse = {
  kpis: {
    revenue: FinancialKpiMetric
    billedOrders: FinancialKpiMetric
    averageTicket: FinancialKpiMetric
  }
  salesSeries: SalesDataPoint[]
  topCustomers: CustomerData[]
  monthlyComparison: MonthlyComparisonData[]
  /** Real count of PAID transactions in the period. Used by the client to estimate funnel stages. */
  paidTransactionsCount: number
}
