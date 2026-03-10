import { z } from 'zod'
import { prisma } from '@/server/utils/prisma'
import { requirePermission } from '@/server/utils/rbacGuards'

const TenantSchema = z.object({
  name: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres').max(100),
})

export default defineEventHandler(async (event) => {
  requirePermission(event, 'tenant:manage')

  const tenantId = event.context.tenantId as string

  const body = await readBody(event)
  const result = TenantSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Dados inválidos',
      data: result.error.issues,
    })
  }

  const { name } = result.data

  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const existingTenant = await prisma.tenant.findFirst({
    where: { slug, id: { not: tenantId } },
    select: { id: true },
  })

  if (existingTenant) {
    throw createError({
      statusCode: 409,
      message: 'Já existe uma empresa com este nome',
    })
  }

  const updated = await prisma.tenant.update({
    where: { id: tenantId },
    data: { name, slug },
  })

  return { tenant: { id: updated.id, name: updated.name, slug: updated.slug } }
})
