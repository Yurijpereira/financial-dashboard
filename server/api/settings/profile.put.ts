import { z } from 'zod'
import { prisma } from '@/server/utils/prisma'

const ProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
})

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id as string
  const body = await readBody(event)
  const result = ProfileSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Dados inválidos',
      data: result.error.issues,
    })
  }

  const { name, email } = result.data

  if (email !== event.context.user.email) {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existing && existing.id !== userId) {
      throw createError({
        statusCode: 409,
        message: 'Este email já está em uso',
      })
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { name, email },
    select: { id: true, email: true, name: true, role: true, tenantId: true },
  })

  await replaceUserSession(event, {
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      tenantId: updated.tenantId,
    },
  })

  return { user: updated }
})
