import { z } from 'zod'
import type {
  ReportPaymentMethod,
  ReportTransactionCategory,
  ReportTransactionStatus,
} from '@/types/reports'
import {
  REPORT_PAYMENT_METHODS,
  REPORT_TRANSACTION_CATEGORIES,
  REPORT_TRANSACTION_STATUSES,
} from '@/types/reports'
import { queryReportTransactions } from '@/server/utils/reportsDataset'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const commaSplit = (s: string | undefined): string[] =>
  s ? s.split(',').map(i => i.trim()).filter(Boolean) : []

const optionalAmount = (s: string | undefined): number | null => {
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
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
  statuses: z.string().max(500).optional().transform(s =>
    commaSplit(s).filter((v): v is ReportTransactionStatus =>
      (REPORT_TRANSACTION_STATUSES as readonly string[]).includes(v)
    )
  ),
  categories: z.string().max(500).optional().transform(s =>
    commaSplit(s).filter((v): v is ReportTransactionCategory =>
      (REPORT_TRANSACTION_CATEGORIES as readonly string[]).includes(v)
    )
  ),
  paymentMethods: z.string().max(500).optional().transform(s =>
    commaSplit(s).filter((v): v is ReportPaymentMethod =>
      (REPORT_PAYMENT_METHODS as readonly string[]).includes(v)
    )
  ),
  minAmount: z.string().optional().transform(optionalAmount),
  maxAmount: z.string().optional().transform(optionalAmount),
  sortField: z.enum(['date', 'amount', 'customerName', 'status']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export default defineEventHandler(async (event) => {
  const raw = getQuery(event)
  const result = TransactionsQuerySchema.safeParse(raw)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Parâmetros inválidos',
      data: result.error.issues,
    })
  }

  try {
    return queryReportTransactions(result.data)
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno ao processar dados',
    })
  }
})
