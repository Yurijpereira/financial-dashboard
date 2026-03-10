import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/server/utils/prisma'

const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  tenantName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = RegisterSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Dados inválidos',
      data: result.error.issues,
    })
  }

  const { email, password, name, tenantName } = result.data

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: 'Este email já está cadastrado',
    })
  }

  const slug = tenantName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const existingTenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (existingTenant) {
    throw createError({
      statusCode: 409,
      message: 'Já existe uma empresa com este nome',
    })
  }

  const passwordHash = await hashPassword(password)

  let user: { id: string; email: string; name: string; role: string; tenantId: string }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const createdTenant = await tx.tenant.create({
        data: { name: tenantName, slug },
      })

      const createdUser = await tx.user.create({
        data: {
          tenantId: createdTenant.id,
          email,
          name,
          passwordHash,
          role: 'ADMIN',
        },
      })

      return { tenant: createdTenant, user: createdUser }
    })

    user = result.user
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[] | undefined) ?? []
      if (target.includes('email')) {
        throw createError({ statusCode: 409, message: 'Este email já está cadastrado' })
      }
      if (target.includes('slug')) {
        throw createError({ statusCode: 409, message: 'Já existe uma empresa com este nome' })
      }
    }
    throw createError({ statusCode: 500, message: 'Erro ao criar conta. Tente novamente.' })
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
