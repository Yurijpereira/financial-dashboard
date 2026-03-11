import { z } from 'zod'
import { prisma } from '@/server/utils/prisma'
import type { Prisma, ProductCategory, TransactionStatus } from '@prisma/client'
import { requirePermission } from '@/server/utils/rbacGuards'
import {
  TransactionFilterSchema,
  buildTransactionWhere,
  buildTransactionOrderBy,
  toLowerStatus,
  toLowerCategory,
  toLowerPayment,
  CATEGORY_TO_DB,
  STATUS_TO_DB,
} from '@/server/utils/reportFilters'
import type {
  ReportChartMetric,
  ReportTransaction,
  ReportTransactionCategory,
  ReportTransactionStatus,
  ReportsTransactionsResponse,
} from '@/types/reports'
import { REPORT_TRANSACTION_CATEGORIES, REPORT_TRANSACTION_STATUSES } from '@/types/reports'

const TransactionsQuerySchema = TransactionFilterSchema.extend({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(5_000).default(15),
  includeMetrics: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  sortField: z.enum(['date', 'amount', 'customerName', 'status']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

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

  if (query.pageSize > 200 && query.includeMetrics) {
    throw createError({
      statusCode: 400,
      message:
        'Volume de dados muito alto para esta operação. Reduza o número de registros ou desative as métricas.',
    })
  }

  if (query.pageSize > 200) {
    requirePermission(event, 'reports:bulk-read')
  }

  try {
    const where = buildTransactionWhere(query, tenantId)
    const orderBy = buildTransactionOrderBy(query.sortField, query.sortOrder)
    const skip = (query.page - 1) * query.pageSize

    const trendEnd = query.endDate ? new Date(query.endDate + 'T23:59:59.999Z') : new Date()
    const trendWindowStart = new Date(trendEnd)
    trendWindowStart.setDate(trendWindowStart.getDate() - 13)
    const queryStartDate = query.startDate ? new Date(query.startDate + 'T00:00:00.000Z') : null
    const effectiveTrendStart =
      queryStartDate && queryStartDate > trendWindowStart ? queryStartDate : trendWindowStart
    const trendWhere: Prisma.TransactionWhereInput = {
      ...where,
      date: { gte: effectiveTrendStart, lte: trendEnd },
    }

    const baseQueries = [
      prisma.transaction.findMany({
        where,
        include: { customer: true, product: true },
        orderBy,
        skip,
        take: query.pageSize,
      }),
      prisma.transaction.count({ where }),
    ] as const

    if (!query.includeMetrics) {
      const [items, total] = await Promise.all(baseQueries)

      const mappedItems: ReportTransaction[] = items.map((transaction) => ({
        id: transaction.id,
        date: transaction.date.toISOString(),
        customerId: transaction.customerId,
        customerName: transaction.customer.name,
        region: transaction.customer.region,
        productId: transaction.productId,
        product: transaction.product.name,
        category: toLowerCategory(transaction.product.category),
        paymentMethod: toLowerPayment(transaction.paymentMethod),
        status: toLowerStatus(transaction.status),
        amount: transaction.amountCents / 100,
        description: transaction.description,
      }))

      const response: ReportsTransactionsResponse = {
        items: mappedItems,
        total,
        page: query.page,
        pageSize: query.pageSize,
        summary: { totalAmount: 0, averageTicket: 0, totalTransactions: 0 },
        metrics: { byCategory: [], byStatus: [], trend: [] },
      }

      return response
    }

    const [items, total, aggregation, statusGroups, productGroups, trendData, products] =
      await Promise.all([
        ...baseQueries,

        prisma.transaction.aggregate({
          where,
          _sum: { amountCents: true },
          _count: { id: true },
        }),

        prisma.transaction.groupBy({
          by: ['status'],
          where,
          _sum: { amountCents: true },
          _count: { id: true },
        }),

        prisma.transaction.groupBy({
          by: ['productId'],
          where,
          _sum: { amountCents: true },
          _count: { id: true },
        }),

        prisma.transaction.findMany({
          where: trendWhere,
          select: { date: true, amountCents: true },
        }),

        prisma.product.findMany({
          where: { tenantId },
          select: { id: true, category: true },
        }),
      ])

    const mappedItems: ReportTransaction[] = items.map((transaction) => ({
      id: transaction.id,
      date: transaction.date.toISOString(),
      customerId: transaction.customerId,
      customerName: transaction.customer.name,
      region: transaction.customer.region,
      productId: transaction.productId,
      product: transaction.product.name,
      category: toLowerCategory(transaction.product.category),
      paymentMethod: toLowerPayment(transaction.paymentMethod),
      status: toLowerStatus(transaction.status),
      amount: transaction.amountCents / 100,
      description: transaction.description,
    }))

    const totalAmount = (aggregation._sum.amountCents ?? 0) / 100
    const totalTransactions = aggregation._count.id
    const averageTicket = totalTransactions > 0 ? totalAmount / totalTransactions : 0

    const productCategoryMap = new Map(products.map((product) => [product.id, product.category]))

    const categoryTotals = new Map<
      ProductCategory,
      { totalAmount: number; transactionsCount: number }
    >()
    for (const group of productGroups) {
      const category = productCategoryMap.get(group.productId)
      if (!category) continue
      const existing = categoryTotals.get(category) ?? { totalAmount: 0, transactionsCount: 0 }
      existing.totalAmount += group._sum.amountCents ?? 0
      existing.transactionsCount += group._count.id
      categoryTotals.set(category, existing)
    }

    const statusTotals = new Map<
      TransactionStatus,
      { totalAmount: number; transactionsCount: number }
    >()
    for (const group of statusGroups) {
      statusTotals.set(group.status, {
        totalAmount: group._sum.amountCents ?? 0,
        transactionsCount: group._count.id,
      })
    }

    const byCategory: ReportChartMetric<ReportTransactionCategory>[] =
      REPORT_TRANSACTION_CATEGORIES.map((key) => {
        const dbKey = CATEGORY_TO_DB[key]
        const data = categoryTotals.get(dbKey)
        return {
          key,
          totalAmount: (data?.totalAmount ?? 0) / 100,
          transactionsCount: data?.transactionsCount ?? 0,
        }
      })
        .filter((metric) => metric.transactionsCount > 0)
        .sort((metricA, metricB) => metricB.totalAmount - metricA.totalAmount)

    const byStatus: ReportChartMetric<ReportTransactionStatus>[] = REPORT_TRANSACTION_STATUSES.map(
      (key) => {
        const dbKey = STATUS_TO_DB[key]
        const data = statusTotals.get(dbKey)
        return {
          key,
          totalAmount: (data?.totalAmount ?? 0) / 100,
          transactionsCount: data?.transactionsCount ?? 0,
        }
      },
    )
      .filter((metric) => metric.transactionsCount > 0)
      .sort((metricA, metricB) => metricB.totalAmount - metricA.totalAmount)

    const trendMap = new Map<string, number>()
    for (const transaction of trendData) {
      const day = transaction.date.toISOString().slice(0, 10)
      trendMap.set(day, (trendMap.get(day) ?? 0) + transaction.amountCents)
    }
    const trend = Array.from(trendMap.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, cents]) => ({ date, totalAmount: cents / 100 }))

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
