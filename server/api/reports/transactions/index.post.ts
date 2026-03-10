import { z } from 'zod'
import { prisma } from '@/server/utils/prisma'
import { TransactionStatus, PaymentMethod } from '@prisma/client'
import { requirePermission } from '@/server/utils/rbac'
import type { ReportTransactionStatus, ReportPaymentMethod } from '@/types/reports'
import { REPORT_TRANSACTION_STATUSES, REPORT_PAYMENT_METHODS } from '@/types/reports'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const STATUS_TO_DB: Record<ReportTransactionStatus, TransactionStatus> = {
  paid: TransactionStatus.PAID,
  pending: TransactionStatus.PENDING,
  failed: TransactionStatus.FAILED,
  refunded: TransactionStatus.REFUNDED,
}

const PAYMENT_TO_DB: Record<ReportPaymentMethod, PaymentMethod> = {
  credit_card: PaymentMethod.CREDIT_CARD,
  pix: PaymentMethod.PIX,
  bank_slip: PaymentMethod.BANK_SLIP,
  bank_transfer: PaymentMethod.BANK_TRANSFER,
}

const CreateTransactionSchema = z.object({
  customerId: z.string().min(1, 'Cliente é obrigatório'),
  productId: z.string().min(1, 'Produto é obrigatório'),
  date: z.string().regex(ISO_DATE, 'Data inválida (esperado: YYYY-MM-DD)'),
  amount: z.number().positive('Valor deve ser maior que zero').max(99_999_999, 'Valor muito alto'),
  status: z.enum(REPORT_TRANSACTION_STATUSES, { message: 'Status inválido' }),
  paymentMethod: z.enum(REPORT_PAYMENT_METHODS, { message: 'Método de pagamento inválido' }),
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Descrição muito longa (máximo 500 caracteres)'),
})

export default defineEventHandler(async (event) => {
  requirePermission(event, 'transactions:create')

  const tenantId = event.context.tenantId as string
  const body = await readBody(event)
  const result = CreateTransactionSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Dados inválidos',
      data: result.error.issues,
    })
  }

  const { customerId, productId, date, amount, status, paymentMethod, description } = result.data

  const [customer, product] = await Promise.all([
    prisma.customer.findFirst({
      where: { id: customerId, tenantId },
      select: { id: true },
    }),
    prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: { id: true },
    }),
  ])

  if (!customer) {
    throw createError({ statusCode: 404, message: 'Cliente não encontrado' })
  }

  if (!product) {
    throw createError({ statusCode: 404, message: 'Produto não encontrado' })
  }

  const transaction = await prisma.transaction.create({
    data: {
      tenantId,
      customerId,
      productId,
      date: new Date(date + 'T12:00:00.000Z'),
      amountCents: Math.round(amount * 100),
      status: STATUS_TO_DB[status],
      paymentMethod: PAYMENT_TO_DB[paymentMethod],
      description: description.trim(),
    },
  })

  setResponseStatus(event, 201)

  return {
    transaction: {
      id: transaction.id,
      date: transaction.date.toISOString(),
      customerId: transaction.customerId,
      productId: transaction.productId,
      status: status,
      paymentMethod: paymentMethod,
      amount: transaction.amountCents / 100,
      description: transaction.description,
    },
  }
})
