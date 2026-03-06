import { z } from 'zod'
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

  const tenant = await prisma.tenant.create({
    data: {
      name: tenantName,
      slug,
    },
  })

  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email,
      name,
      passwordHash,
      role: 'ADMIN',
    },
  })

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
