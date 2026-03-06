import { z } from 'zod'
import { prisma } from '@/server/utils/prisma'
import { Prisma, TransactionStatus, ProductCategory, PaymentMethod } from '@prisma/client'
import type {
  ReportPaymentMethod,
  ReportTransactionCategory,
  ReportTransactionStatus,
  ReportChartMetric,
  ReportTransaction,
  ReportsTransactionsResponse,
} from '@/types/reports'
import {
  REPORT_PAYMENT_METHODS,
  REPORT_TRANSACTION_CATEGORIES,
  REPORT_TRANSACTION_STATUSES,
} from '@/types/reports'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const commaSplit = (input: string | undefined): string[] =>
  input ? input.split(',').map((item) => item.trim()).filter(Boolean) : []

const optionalAmount = (input: string | undefined): number | null => {
  if (!input) return null
  const parsed = Number(input)
  return Number.isFinite(parsed) ? parsed : null
}

const TransactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(15),
  startDate: z.string().regex(ISO_DATE, 'Data inválida (esperado: YYYY-MM-DD)').optional(),
  endDate: z.string().regex(ISO_DATE, 'Data inválida (esperado: YYYY-MM-DD)').optional(),
  search: z.string().max(200).trim().optional(),
  customers: z.string().max(1_000).optional().transform(commaSplit),
  regions: z.string().max(1_000).optional().transform(commaSplit),
  products: z.string().max(1_000).optional().transform(commaSplit),
  statuses: z.string().max(500).optional().transform((raw) =>
    commaSplit(raw).filter((status): status is ReportTransactionStatus =>
      (REPORT_TRANSACTION_STATUSES as readonly string[]).includes(status)
    )
  ),
  categories: z.string().max(500).optional().transform((raw) =>
    commaSplit(raw).filter((category): category is ReportTransactionCategory =>
      (REPORT_TRANSACTION_CATEGORIES as readonly string[]).includes(category)
    )
  ),
  paymentMethods: z.string().max(500).optional().transform((raw) =>
    commaSplit(raw).filter((method): method is ReportPaymentMethod =>
      (REPORT_PAYMENT_METHODS as readonly string[]).includes(method)
    )
  ),
  minAmount: z.string().optional().transform(optionalAmount),
  maxAmount: z.string().optional().transform(optionalAmount),
  sortField: z.enum(['date', 'amount', 'customerName', 'status']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// ── Enum mapping helpers ──────────────────────────────────

const STATUS_TO_DB: Record<ReportTransactionStatus, TransactionStatus> = {
  paid: TransactionStatus.PAID,
  pending: TransactionStatus.PENDING,
  failed: TransactionStatus.FAILED,
  refunded: TransactionStatus.REFUNDED,
}

const CATEGORY_TO_DB: Record<ReportTransactionCategory, ProductCategory> = {
  subscription: ProductCategory.SUBSCRIPTION,
  service: ProductCategory.SERVICE,
  hardware: ProductCategory.HARDWARE,
  support: ProductCategory.SUPPORT,
  training: ProductCategory.TRAINING,
}

const PAYMENT_TO_DB: Record<ReportPaymentMethod, PaymentMethod> = {
  credit_card: PaymentMethod.CREDIT_CARD,
  pix: PaymentMethod.PIX,
  bank_slip: PaymentMethod.BANK_SLIP,
  bank_transfer: PaymentMethod.BANK_TRANSFER,
}

function toLowerStatus(status: TransactionStatus): ReportTransactionStatus {
  return status.toLowerCase() as ReportTransactionStatus
}

function toLowerCategory(category: ProductCategory): ReportTransactionCategory {
  return category.toLowerCase() as ReportTransactionCategory
}

function toLowerPayment(payment: PaymentMethod): ReportPaymentMethod {
  return payment.toLowerCase() as ReportPaymentMethod
}

// ── Main handler ──────────────────────────────────────────

export default defineEventHandler(async (event) => {
  const tenantId = event.context.tenantId as string
  const raw = getQuery(event)
  const result = TransactionsQuerySchema.safeParse(raw)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Parâmetros inválidos',
      data: result.error.issues,
    })
  }

  const query = result.data

  try {
    // ── Build WHERE clause ────────────────────────────
    const where: Prisma.TransactionWhereInput = { tenantId }

    if (query.startDate || query.endDate) {
      where.date = {}
      if (query.startDate) where.date.gte = new Date(query.startDate + 'T00:00:00.000Z')
      if (query.endDate) where.date.lte = new Date(query.endDate + 'T23:59:59.999Z')
    }

    if (query.customers.length > 0) where.customerId = { in: query.customers }

    if (query.regions.length > 0) {
      where.customer = { region: { in: query.regions } }
    }

    if (query.products.length > 0) where.productId = { in: query.products }

    if (query.statuses.length > 0) {
      where.status = { in: query.statuses.map((status) => STATUS_TO_DB[status]) }
    }

    if (query.categories.length > 0) {
      const dbCategories = query.categories.map((category) => CATEGORY_TO_DB[category])
      where.product = { is: { category: { in: dbCategories } } }
    }

    if (query.paymentMethods.length > 0) {
      where.paymentMethod = { in: query.paymentMethods.map((method) => PAYMENT_TO_DB[method]) }
    }

    if (query.minAmount !== null || query.maxAmount !== null) {
      where.amountCents = {}
      if (query.minAmount !== null) where.amountCents.gte = Math.round(query.minAmount * 100)
      if (query.maxAmount !== null) where.amountCents.lte = Math.round(query.maxAmount * 100)
    }

    if (query.search) {
      const search = query.search.toLowerCase()
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    // ── Build ORDER BY ────────────────────────────────
    type OrderByInput = Prisma.TransactionOrderByWithRelationInput
    let orderBy: OrderByInput

    if (query.sortField === 'customerName') {
      orderBy = { customer: { name: query.sortOrder } }
    } else if (query.sortField === 'amount') {
      orderBy = { amountCents: query.sortOrder }
    } else if (query.sortField === 'status') {
      orderBy = { status: query.sortOrder }
    } else {
      orderBy = { date: query.sortOrder }
    }

    // ── Execute queries in parallel ───────────────────
    const skip = (query.page - 1) * query.pageSize

    const [items, total, aggregation, allForMetrics] = await Promise.all([
      // Paginated items
      prisma.transaction.findMany({
        where,
        include: { customer: true, product: true },
        orderBy,
        skip,
        take: query.pageSize,
      }),

      // Total count
      prisma.transaction.count({ where }),

      // Summary aggregation
      prisma.transaction.aggregate({
        where,
        _sum: { amountCents: true },
        _count: { id: true },
      }),

      // All matching records for metrics (lightweight)
      prisma.transaction.findMany({
        where,
        select: {
          amountCents: true,
          status: true,
          date: true,
          product: { select: { category: true } },
        },
      }),
    ])

    // ── Map items to API format ───────────────────────
    const mappedItems: ReportTransaction[] = items.map((transaction) => ({
      id: transaction.id,
      date: transaction.date.toISOString(),
      customerId: transaction.customerId,
      customerName: transaction.customer.name,
      region: transaction.customer.region,
      product: transaction.product.name,
      category: toLowerCategory(transaction.product.category),
      paymentMethod: toLowerPayment(transaction.paymentMethod),
      status: toLowerStatus(transaction.status),
      amount: transaction.amountCents / 100,
      description: transaction.description,
    }))

    // ── Summary ───────────────────────────────────────
    const totalAmount = (aggregation._sum.amountCents ?? 0) / 100
    const totalTransactions = aggregation._count.id
    const averageTicket = totalTransactions > 0 ? totalAmount / totalTransactions : 0

    // ── Category metrics ──────────────────────────────
    const categoryTotals = new Map<ProductCategory, { totalAmount: number; transactionsCount: number }>()
    const statusTotals = new Map<TransactionStatus, { totalAmount: number; transactionsCount: number }>()

    for (const transaction of allForMetrics) {
      // By category
      const cat = transaction.product.category
      const catEntry = categoryTotals.get(cat) ?? { totalAmount: 0, transactionsCount: 0 }
      catEntry.totalAmount += transaction.amountCents
      catEntry.transactionsCount += 1
      categoryTotals.set(cat, catEntry)

      // By status
      const st = transaction.status
      const stEntry = statusTotals.get(st) ?? { totalAmount: 0, transactionsCount: 0 }
      stEntry.totalAmount += transaction.amountCents
      stEntry.transactionsCount += 1
      statusTotals.set(st, stEntry)
    }

    const byCategory: ReportChartMetric<ReportTransactionCategory>[] = REPORT_TRANSACTION_CATEGORIES
      .map((key) => {
        const dbKey = CATEGORY_TO_DB[key]
        const data = categoryTotals.get(dbKey)
        return {
          key,
          totalAmount: (data?.totalAmount ?? 0) / 100,
          transactionsCount: data?.transactionsCount ?? 0,
        }
      })
      .filter((m) => m.transactionsCount > 0)
      .sort((metricA, metricB) => metricB.totalAmount - metricA.totalAmount)

    const byStatus: ReportChartMetric<ReportTransactionStatus>[] = REPORT_TRANSACTION_STATUSES
      .map((key) => {
        const dbKey = STATUS_TO_DB[key]
        const data = statusTotals.get(dbKey)
        return {
          key,
          totalAmount: (data?.totalAmount ?? 0) / 100,
          transactionsCount: data?.transactionsCount ?? 0,
        }
      })
      .filter((m) => m.transactionsCount > 0)
      .sort((metricA, metricB) => metricB.totalAmount - metricA.totalAmount)

    // ── Trend (last 14 days) ──────────────────────────
    const trendMap = new Map<string, number>()
    for (const transaction of allForMetrics) {
      const day = transaction.date.toISOString().slice(0, 10)
      trendMap.set(day, (trendMap.get(day) ?? 0) + transaction.amountCents)
    }
    const trend = Array.from(trendMap.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .slice(-14)
      .map(([date, cents]) => ({ date, totalAmount: cents / 100 }))

    // ── Response ──────────────────────────────────────
    const response: ReportsTransactionsResponse = {
      items: mappedItems,
      total,
      page: query.page,
      pageSize: query.pageSize,
      summary: {
        totalAmount: Math.round(totalAmount * 100) / 100,
        averageTicket: Math.round(averageTicket * 100) / 100,
        totalTransactions,
      },
      metrics: {
        byCategory,
        byStatus,
        trend,
      },
    }

    return response
  } catch (error) {
    console.error('Transactions endpoint error:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro interno ao processar dados',
    })
  }
})
