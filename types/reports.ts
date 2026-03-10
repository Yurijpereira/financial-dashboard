export const REPORT_TRANSACTION_STATUSES = ['paid', 'pending', 'failed', 'refunded'] as const
export type ReportTransactionStatus = (typeof REPORT_TRANSACTION_STATUSES)[number]

export const REPORT_TRANSACTION_CATEGORIES = [
  'subscription',
  'service',
  'hardware',
  'support',
  'training',
] as const
export type ReportTransactionCategory = (typeof REPORT_TRANSACTION_CATEGORIES)[number]

export const REPORT_PAYMENT_METHODS = ['credit_card', 'pix', 'bank_slip', 'bank_transfer'] as const
export type ReportPaymentMethod = (typeof REPORT_PAYMENT_METHODS)[number]

export const REPORT_STATUS_LABELS: Record<ReportTransactionStatus, string> = {
  paid: 'Pago',
  pending: 'Pendente',
  failed: 'Falha',
  refunded: 'Estornado',
}

export const REPORT_CATEGORY_LABELS: Record<ReportTransactionCategory, string> = {
  subscription: 'Assinatura',
  service: 'Serviço',
  hardware: 'Hardware',
  support: 'Suporte',
  training: 'Treinamento',
}

export const REPORT_PAYMENT_METHOD_LABELS: Record<ReportPaymentMethod, string> = {
  credit_card: 'Cartão de crédito',
  pix: 'Pix',
  bank_slip: 'Boleto',
  bank_transfer: 'Transferência',
}

export type ReportTransaction = {
  id: string
  date: string
  customerId: string
  customerName: string
  region: string
  product: string
  category: ReportTransactionCategory
  paymentMethod: ReportPaymentMethod
  status: ReportTransactionStatus
  amount: number
  description: string
}

export type ReportsAdvancedFilters = {
  statuses: ReportTransactionStatus[]
  categories: ReportTransactionCategory[]
  paymentMethods: ReportPaymentMethod[]
  minAmount: number | null
  maxAmount: number | null
}

export type ReportSortField = 'date' | 'amount' | 'customerName' | 'status'
export type ReportSortOrder = 'asc' | 'desc'

export type ReportChartMetric<T extends string> = {
  key: T
  totalAmount: number
  transactionsCount: number
}

export type ReportTrendPoint = {
  date: string
  totalAmount: number
}

export type ReportsTransactionsResponse = {
  items: ReportTransaction[]
  total: number
  page: number
  pageSize: number
  summary: {
    totalAmount: number
    averageTicket: number
    totalTransactions: number
  }
  metrics: {
    byCategory: ReportChartMetric<ReportTransactionCategory>[]
    byStatus: ReportChartMetric<ReportTransactionStatus>[]
    trend: ReportTrendPoint[]
  }
}

export type TransactionFormData = {
  customerId: string
  productId: string
  date: string
  amount: number
  status: ReportTransactionStatus
  paymentMethod: ReportPaymentMethod
  description: string
}

export type TransactionResponse = {
  transaction: {
    id: string
    date: string
    customerId: string
    productId: string
    status: string
    paymentMethod: string
    amount: number
    description: string
  }
}
