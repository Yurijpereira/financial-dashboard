import { z } from 'zod'
import { prisma } from '@/server/utils/prisma'

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
})

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id as string
  const body = await readBody(event)
  const result = PasswordSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Dados inválidos',
      data: result.error.issues,
    })
  }

  const { currentPassword, newPassword } = result.data

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { passwordHash: true },
  })

  const isValid = await verifyPassword(user.passwordHash, currentPassword)

  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: 'Senha atual incorreta',
    })
  }

  const newHash = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  })

  return { success: true }
})
