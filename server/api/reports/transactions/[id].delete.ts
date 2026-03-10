import { prisma } from '@/server/utils/prisma'
import { requirePermission } from '@/server/utils/rbac'

export default defineEventHandler(async (event) => {
  requirePermission(event, 'transactions:delete')

  const tenantId = event.context.tenantId as string
  const transactionId = getRouterParam(event, 'id')

  if (!transactionId) {
    throw createError({ statusCode: 400, message: 'ID da transação é obrigatório' })
  }

  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, tenantId },
    select: { id: true },
  })

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Transação não encontrada' })
  }

  await prisma.transaction.delete({
    where: { id: transactionId },
  })

  setResponseStatus(event, 204)
  return null
})
