import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id as string
  const tenantId = event.context.tenantId as string

  const [user, tenant] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    }),
    prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
      select: { id: true, name: true, slug: true, createdAt: true },
    }),
  ])

  return { user, tenant }
})
