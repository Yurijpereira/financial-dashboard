import { z } from 'zod'
import { prisma } from '@/server/utils/prisma'

const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = LoginSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Dados inválidos',
      data: result.error.issues,
    })
  }

  const { email, password } = result.data

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tenantId: true,
      passwordHash: true,
    },
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Email ou senha inválidos',
    })
  }

  const isValid = await verifyPassword(user.passwordHash, password)

  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: 'Email ou senha inválidos',
    })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    },
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  }
})
