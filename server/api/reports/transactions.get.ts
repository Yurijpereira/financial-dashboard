import type {
  ReportPaymentMethod,
  ReportSortField,
  ReportSortOrder,
  ReportTransactionCategory,
  ReportTransactionStatus,
} from '@/types/reports'
import {
  REPORT_PAYMENT_METHODS,
  REPORT_TRANSACTION_CATEGORIES,
  REPORT_TRANSACTION_STATUSES,
} from '@/types/reports'
import { queryReportTransactions } from '@/server/utils/reportsDataset'

function toNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toAmount(value: string | undefined): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toStringArray(value: string | undefined): string[] {
  if (!value) return []

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toStatuses(values: string[]): ReportTransactionStatus[] {
  return values.filter((value): value is ReportTransactionStatus => {
    return (REPORT_TRANSACTION_STATUSES as readonly string[]).includes(value)
  })
}

function toCategories(values: string[]): ReportTransactionCategory[] {
  return values.filter((value): value is ReportTransactionCategory => {
    return (REPORT_TRANSACTION_CATEGORIES as readonly string[]).includes(value)
  })
}

function toPaymentMethods(values: string[]): ReportPaymentMethod[] {
  return values.filter((value): value is ReportPaymentMethod => {
    return (REPORT_PAYMENT_METHODS as readonly string[]).includes(value)
  })
}

function toSortField(value: string | undefined): ReportSortField {
  if (value === 'amount' || value === 'customerName' || value === 'status') {
    return value
  }

  return 'date'
}

function toSortOrder(value: string | undefined): ReportSortOrder {
  return value === 'asc' ? 'asc' : 'desc'
}

export default defineEventHandler((event) => {
  const query = getQuery(event)

  return queryReportTransactions({
    page: toNumber(query.page as string | undefined, 1),
    pageSize: toNumber(query.pageSize as string | undefined, 15),
    startDate: query.startDate as string | undefined,
    endDate: query.endDate as string | undefined,
    search: query.search as string | undefined,
    customers: toStringArray(query.customers as string | undefined),
    regions: toStringArray(query.regions as string | undefined),
    products: toStringArray(query.products as string | undefined),
    statuses: toStatuses(toStringArray(query.statuses as string | undefined)),
    categories: toCategories(toStringArray(query.categories as string | undefined)),
    paymentMethods: toPaymentMethods(toStringArray(query.paymentMethods as string | undefined)),
    minAmount: toAmount(query.minAmount as string | undefined),
    maxAmount: toAmount(query.maxAmount as string | undefined),
    sortField: toSortField(query.sortField as string | undefined),
    sortOrder: toSortOrder(query.sortOrder as string | undefined),
  })
})
