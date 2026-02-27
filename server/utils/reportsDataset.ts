import type {
  ReportChartMetric,
  ReportPaymentMethod,
  ReportSortField,
  ReportSortOrder,
  ReportTransaction,
  ReportTransactionCategory,
  ReportTransactionStatus,
  ReportsTransactionsResponse,
} from '@/types/reports'
import {
  REPORT_TRANSACTION_CATEGORIES,
  REPORT_TRANSACTION_STATUSES,
} from '@/types/reports'

type ReportCustomer = {
  id: string
  name: string
  region: string
}

type ReportsDatasetQuery = {
  page: number
  pageSize: number
  startDate?: string
  endDate?: string
  search?: string
  customers: string[]
  regions: string[]
  products: string[]
  statuses: ReportTransactionStatus[]
  categories: ReportTransactionCategory[]
  paymentMethods: ReportPaymentMethod[]
  minAmount: number | null
  maxAmount: number | null
  sortField: ReportSortField
  sortOrder: ReportSortOrder
}

const CUSTOMER_CATALOG: ReportCustomer[] = [
  { id: 'c_1', name: 'Tech Solutions Brasil', region: 'sudeste' },
  { id: 'c_2', name: 'Investimentos LTDA.', region: 'sudeste' },
  { id: 'c_3', name: 'Fintech Empresarial', region: 'sul' },
  { id: 'c_4', name: 'Consultoria Digital', region: 'nordeste' },
  { id: 'c_5', name: 'Grupo Inovacao', region: 'norte' },
  { id: 'c_6', name: 'Sistemas Integrados', region: 'centro-oeste' },
  { id: 'c_7', name: 'TechCorp Solutions', region: 'sul' },
]

const PRODUCTS_BY_CATEGORY: Record<ReportTransactionCategory, string[]> = {
  subscription: ['Software', 'Licencas'],
  service: ['Consultoria', 'Integracao'],
  hardware: ['Hardware', 'Perifericos'],
  support: ['Suporte Tecnico', 'Monitoramento'],
  training: ['Treinamento', 'Workshop'],
}

const BASE_AMOUNT_BY_CATEGORY: Record<ReportTransactionCategory, number> = {
  subscription: 1200,
  service: 2400,
  hardware: 3200,
  support: 900,
  training: 1500,
}

const STATUS_WEIGHTS: Array<{ value: ReportTransactionStatus; weight: number }> = [
  { value: 'paid', weight: 72 },
  { value: 'pending', weight: 16 },
  { value: 'failed', weight: 7 },
  { value: 'refunded', weight: 5 },
]

const CATEGORY_WEIGHTS: Array<{ value: ReportTransactionCategory; weight: number }> = [
  { value: 'subscription', weight: 26 },
  { value: 'service', weight: 24 },
  { value: 'hardware', weight: 18 },
  { value: 'support', weight: 20 },
  { value: 'training', weight: 12 },
]

const PAYMENT_WEIGHTS: Array<{ value: ReportPaymentMethod; weight: number }> = [
  { value: 'credit_card', weight: 40 },
  { value: 'pix', weight: 34 },
  { value: 'bank_slip', weight: 14 },
  { value: 'bank_transfer', weight: 12 },
]

const REPORT_TRANSACTIONS_DATASET = buildReportTransactions(420)

function createSeededRandom(seed: number): () => number {
  let state = seed % 2147483647

  if (state <= 0) {
    state += 2147483646
  }

  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

function pickWeighted<T>(random: () => number, values: Array<{ value: T; weight: number }>): T {
  if (values.length === 0) {
    throw new Error('pickWeighted requires at least one value')
  }

  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0)
  const threshold = random() * totalWeight
  let cumulative = 0

  for (const item of values) {
    cumulative += item.weight
    if (threshold <= cumulative) {
      return item.value
    }
  }

  const fallback = values[values.length - 1]

  if (!fallback) {
    throw new Error('pickWeighted fallback value was not found')
  }

  return fallback.value
}

function pickRandom<T>(random: () => number, values: T[]): T {
  if (values.length === 0) {
    throw new Error('pickRandom requires at least one value')
  }

  const index = Math.floor(random() * values.length)
  const value = values[index]

  if (value === undefined) {
    throw new Error('pickRandom selected an invalid index')
  }

  return value
}

function randomDate(random: () => number, minDate: Date, maxDate: Date): Date {
  const minTimestamp = minDate.getTime()
  const maxTimestamp = maxDate.getTime()
  const timestamp = Math.floor(minTimestamp + random() * (maxTimestamp - minTimestamp))
  return new Date(timestamp)
}

function buildReportTransactions(totalRecords: number): ReportTransaction[] {
  const random = createSeededRandom(20260224)
  const startDate = new Date('2025-01-01T00:00:00.000Z')
  const endDate = new Date('2026-02-24T23:59:59.999Z')
  const transactions: ReportTransaction[] = []

  for (let index = 0; index < totalRecords; index += 1) {
    const customer = pickRandom(random, CUSTOMER_CATALOG)
    const category = pickWeighted(random, CATEGORY_WEIGHTS)
    const paymentMethod = pickWeighted(random, PAYMENT_WEIGHTS)
    const status = pickWeighted(random, STATUS_WEIGHTS)
    const product = pickRandom(random, PRODUCTS_BY_CATEGORY[category])
    const date = randomDate(random, startDate, endDate)
    const categoryBaseAmount = BASE_AMOUNT_BY_CATEGORY[category]
    const variableFactor = 0.7 + random() * 2.4
    const statusFactor = status === 'refunded' ? 0.65 : 1
    const amount = Math.round(categoryBaseAmount * variableFactor * statusFactor)
    const isoDate = date.toISOString()
    const dateCode = isoDate.slice(0, 10).replace(/-/g, '')
    const id = `TX-${dateCode}-${String(index + 1).padStart(5, '0')}`

    transactions.push({
      id,
      date: isoDate,
      customerId: customer.id,
      customerName: customer.name,
      region: customer.region,
      product,
      category,
      paymentMethod,
      status,
      amount,
      description: `${product} - ciclo ${String(index + 1).padStart(3, '0')} - ${customer.name}`,
    })
  }

  return transactions.sort((first, second) => {
    return new Date(second.date).getTime() - new Date(first.date).getTime()
  })
}

function parseDateToTimestamp(value: string | undefined, endOfDay = false): number | null {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  if (endOfDay) {
    date.setHours(23, 59, 59, 999)
  } else {
    date.setHours(0, 0, 0, 0)
  }

  return date.getTime()
}

function isAllowedStatus(statuses: ReportTransactionStatus[], status: ReportTransactionStatus): boolean {
  return statuses.length === 0 || statuses.includes(status)
}

function isAllowedCategory(
  categories: ReportTransactionCategory[],
  category: ReportTransactionCategory
): boolean {
  return categories.length === 0 || categories.includes(category)
}

function isAllowedPaymentMethod(
  paymentMethods: ReportPaymentMethod[],
  paymentMethod: ReportPaymentMethod
): boolean {
  return paymentMethods.length === 0 || paymentMethods.includes(paymentMethod)
}

function buildMetric<T extends string>(
  values: readonly T[],
  keySelector: (transaction: ReportTransaction) => T
) {
  return (transactions: ReportTransaction[]): ReportChartMetric<T>[] => {
    const totals = new Map<T, { totalAmount: number; transactionsCount: number }>()

    for (const value of values) {
      totals.set(value, {
        totalAmount: 0,
        transactionsCount: 0,
      })
    }

    for (const transaction of transactions) {
      const key = keySelector(transaction)
      const current = totals.get(key)

      if (!current) {
        continue
      }

      current.totalAmount += transaction.amount
      current.transactionsCount += 1
    }

    return values
      .map((key) => {
        const value = totals.get(key)
        return {
          key,
          totalAmount: value?.totalAmount ?? 0,
          transactionsCount: value?.transactionsCount ?? 0,
        }
      })
      .filter((metric) => metric.transactionsCount > 0)
      .sort((first, second) => second.totalAmount - first.totalAmount)
  }
}

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function matchesProductsFilter(productFilters: string[], transaction: ReportTransaction): boolean {
  if (productFilters.length === 0) {
    return true
  }

  const normalizedProduct = normalizeToken(transaction.product)

  return productFilters.some((rawFilter) => {
    const filter = normalizeToken(rawFilter)

    if (filter === 'software' || filter === 'licencas') {
      return transaction.category === 'subscription'
    }

    if (filter === 'consultoria') {
      return transaction.category === 'service'
    }

    if (filter === 'suporte') {
      return transaction.category === 'support'
    }

    if (filter === 'treinamento') {
      return transaction.category === 'training'
    }

    if (filter === 'hardware') {
      return transaction.category === 'hardware'
    }

    return normalizedProduct.includes(filter)
  })
}

function buildTrendMetrics(transactions: ReportTransaction[]) {
  const totalsByDate = new Map<string, number>()

  for (const transaction of transactions) {
    const date = transaction.date.slice(0, 10)
    const current = totalsByDate.get(date) ?? 0
    totalsByDate.set(date, current + transaction.amount)
  }

  return Array.from(totalsByDate.entries())
    .sort((first, second) => first[0].localeCompare(second[0]))
    .slice(-14)
    .map(([date, totalAmount]) => ({
      date,
      totalAmount,
    }))
}

function compareTransactions(
  first: ReportTransaction,
  second: ReportTransaction,
  sortField: ReportSortField,
  sortOrder: ReportSortOrder
): number {
  const direction = sortOrder === 'asc' ? 1 : -1

  if (sortField === 'amount') {
    return (first.amount - second.amount) * direction
  }

  if (sortField === 'customerName') {
    return first.customerName.localeCompare(second.customerName) * direction
  }

  if (sortField === 'status') {
    return first.status.localeCompare(second.status) * direction
  }

  return (new Date(first.date).getTime() - new Date(second.date).getTime()) * direction
}

function filterTransactions(query: ReportsDatasetQuery): ReportTransaction[] {
  const searchValue = query.search?.trim().toLowerCase() ?? ''
  const startTimestamp = parseDateToTimestamp(query.startDate)
  const endTimestamp = parseDateToTimestamp(query.endDate, true)

  return REPORT_TRANSACTIONS_DATASET.filter((transaction) => {
    const transactionTimestamp = new Date(transaction.date).getTime()

    if (startTimestamp !== null && transactionTimestamp < startTimestamp) {
      return false
    }

    if (endTimestamp !== null && transactionTimestamp > endTimestamp) {
      return false
    }

    if (query.customers.length > 0 && !query.customers.includes(transaction.customerId)) {
      return false
    }

    if (query.regions.length > 0 && !query.regions.includes(transaction.region)) {
      return false
    }

    if (!matchesProductsFilter(query.products, transaction)) {
      return false
    }

    if (!isAllowedStatus(query.statuses, transaction.status)) {
      return false
    }

    if (!isAllowedCategory(query.categories, transaction.category)) {
      return false
    }

    if (!isAllowedPaymentMethod(query.paymentMethods, transaction.paymentMethod)) {
      return false
    }

    if (query.minAmount !== null && transaction.amount < query.minAmount) {
      return false
    }

    if (query.maxAmount !== null && transaction.amount > query.maxAmount) {
      return false
    }

    if (!searchValue) {
      return true
    }

    const searchableValue = [
      transaction.id,
      transaction.customerName,
      transaction.product,
      transaction.description,
      transaction.status,
    ]
      .join(' ')
      .toLowerCase()

    return searchableValue.includes(searchValue)
  })
}

export function queryReportTransactions(query: ReportsDatasetQuery): ReportsTransactionsResponse {
  const page = Number.isFinite(query.page) && query.page > 0 ? Math.floor(query.page) : 1
  const pageSize =
    Number.isFinite(query.pageSize) && query.pageSize > 0
      ? Math.min(Math.floor(query.pageSize), 5000)
      : 15

  const filteredTransactions = filterTransactions(query).sort((first, second) => {
    return compareTransactions(first, second, query.sortField, query.sortOrder)
  })

  const total = filteredTransactions.length
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const items = filteredTransactions.slice(startIndex, endIndex)

  const totalAmount = filteredTransactions.reduce((sum, item) => sum + item.amount, 0)
  const buildCategoryMetrics = buildMetric(REPORT_TRANSACTION_CATEGORIES, (transaction) => {
    return transaction.category
  })
  const buildStatusMetrics = buildMetric(REPORT_TRANSACTION_STATUSES, (transaction) => {
    return transaction.status
  })

  return {
    items,
    total,
    page,
    pageSize,
    summary: {
      totalAmount,
      totalTransactions: total,
      averageTicket: total > 0 ? totalAmount / total : 0,
    },
    metrics: {
      byCategory: buildCategoryMetrics(filteredTransactions),
      byStatus: buildStatusMetrics(filteredTransactions),
      trend: buildTrendMetrics(filteredTransactions),
    },
  }
}

export type { ReportsDatasetQuery }
