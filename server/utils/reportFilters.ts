import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { TransactionStatus, ProductCategory, PaymentMethod } from '@prisma/client'
import type {
  ReportPaymentMethod,
  ReportTransactionCategory,
  ReportTransactionStatus,
  ReportSortField,
  ReportSortOrder,
} from '@/types/reports'
import {
  REPORT_PAYMENT_METHODS,
  REPORT_TRANSACTION_CATEGORIES,
  REPORT_TRANSACTION_STATUSES,
} from '@/types/reports'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const commaSplit = (input: string | undefined): string[] =>
  input
    ? input
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : []

const optionalAmount = (input: string | undefined): number | null => {
  if (input === undefined || input === '') return null
  const parsed = Number(input)
  return Number.isFinite(parsed) ? parsed : null
}

export const TransactionFilterSchema = z.object({
  startDate: z.string().regex(ISO_DATE, 'Data inválida (esperado: YYYY-MM-DD)').optional(),
  endDate: z.string().regex(ISO_DATE, 'Data inválida (esperado: YYYY-MM-DD)').optional(),
  search: z.string().max(200).trim().optional(),
  customers: z.string().max(1_000).optional().transform(commaSplit),
  regions: z.string().max(1_000).optional().transform(commaSplit),
  products: z.string().max(1_000).optional().transform(commaSplit),
  statuses: z
    .string()
    .max(500)
    .optional()
    .transform((raw) =>
      commaSplit(raw).filter((s): s is ReportTransactionStatus =>
        (REPORT_TRANSACTION_STATUSES as readonly string[]).includes(s),
      ),
    ),
  categories: z
    .string()
    .max(500)
    .optional()
    .transform((raw) =>
      commaSplit(raw).filter((c): c is ReportTransactionCategory =>
        (REPORT_TRANSACTION_CATEGORIES as readonly string[]).includes(c),
      ),
    ),
  paymentMethods: z
    .string()
    .max(500)
    .optional()
    .transform((raw) =>
      commaSplit(raw).filter((m): m is ReportPaymentMethod =>
        (REPORT_PAYMENT_METHODS as readonly string[]).includes(m),
      ),
    ),
  minAmount: z.string().optional().transform(optionalAmount),
  maxAmount: z.string().optional().transform(optionalAmount),
})

export type TransactionFilters = z.output<typeof TransactionFilterSchema>

export const STATUS_TO_DB: Record<ReportTransactionStatus, TransactionStatus> = {
  paid: TransactionStatus.PAID,
  pending: TransactionStatus.PENDING,
  failed: TransactionStatus.FAILED,
  refunded: TransactionStatus.REFUNDED,
}

export const CATEGORY_TO_DB: Record<ReportTransactionCategory, ProductCategory> = {
  subscription: ProductCategory.SUBSCRIPTION,
  service: ProductCategory.SERVICE,
  hardware: ProductCategory.HARDWARE,
  support: ProductCategory.SUPPORT,
  training: ProductCategory.TRAINING,
}

export const PAYMENT_TO_DB: Record<ReportPaymentMethod, PaymentMethod> = {
  credit_card: PaymentMethod.CREDIT_CARD,
  pix: PaymentMethod.PIX,
  bank_slip: PaymentMethod.BANK_SLIP,
  bank_transfer: PaymentMethod.BANK_TRANSFER,
}

export function buildTransactionWhere(
  filters: TransactionFilters,
  tenantId: string,
): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { tenantId }

  if (filters.startDate || filters.endDate) {
    where.date = {}
    if (filters.startDate) where.date.gte = new Date(filters.startDate + 'T00:00:00.000Z')
    if (filters.endDate) where.date.lte = new Date(filters.endDate + 'T23:59:59.999Z')
  }

  if (filters.customers.length > 0) where.customerId = { in: filters.customers }

  const customerRelation: Prisma.CustomerWhereInput = {}
  if (filters.regions.length > 0) customerRelation.region = { in: filters.regions }
  if (Object.keys(customerRelation).length > 0) where.customer = customerRelation

  if (filters.products.length > 0) where.productId = { in: filters.products }

  if (filters.statuses.length > 0) {
    where.status = { in: filters.statuses.map((s) => STATUS_TO_DB[s]) }
  }

  if (filters.categories.length > 0) {
    where.product = {
      is: { category: { in: filters.categories.map((c) => CATEGORY_TO_DB[c]) } },
    }
  }

  if (filters.paymentMethods.length > 0) {
    where.paymentMethod = { in: filters.paymentMethods.map((m) => PAYMENT_TO_DB[m]) }
  }

  if (filters.minAmount !== null || filters.maxAmount !== null) {
    where.amountCents = {}
    if (filters.minAmount !== null) where.amountCents.gte = Math.round(filters.minAmount * 100)
    if (filters.maxAmount !== null) where.amountCents.lte = Math.round(filters.maxAmount * 100)
  }

  if (filters.search) {
    const search = filters.search.toLowerCase()
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { product: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  return where
}

export function buildTransactionOrderBy(
  sortField: ReportSortField,
  sortOrder: ReportSortOrder,
): Prisma.TransactionOrderByWithRelationInput {
  if (sortField === 'customerName') return { customer: { name: sortOrder } }
  if (sortField === 'amount') return { amountCents: sortOrder }
  if (sortField === 'status') return { status: sortOrder }
  return { date: sortOrder }
}

export function toLowerStatus(status: TransactionStatus): ReportTransactionStatus {
  return status.toLowerCase() as ReportTransactionStatus
}

export function toLowerCategory(category: ProductCategory): ReportTransactionCategory {
  return category.toLowerCase() as ReportTransactionCategory
}

export function toLowerPayment(payment: PaymentMethod): ReportPaymentMethod {
  return payment.toLowerCase() as ReportPaymentMethod
}
