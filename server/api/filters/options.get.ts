import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const tenantId = event.context.tenantId as string

  const [customers, products, customersForRegions] = await Promise.all([
    prisma.customer.findMany({
      where: { tenantId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where: { tenantId },
      select: { id: true, name: true, category: true },
      orderBy: { name: 'asc' },
    }),
    prisma.customer.findMany({
      where: { tenantId },
      select: { region: true },
      distinct: ['region'],
      orderBy: { region: 'asc' },
    }),
  ])

  const regionLabels: Record<string, string> = {
    sudeste: 'Sudeste',
    sul: 'Sul',
    nordeste: 'Nordeste',
    norte: 'Norte',
    'centro-oeste': 'Centro-Oeste',
  }

  return {
    customers: customers.map((customer) => ({ value: customer.id, label: customer.name })),
    regions: customersForRegions.map((customer) => ({
      value: customer.region,
      label: regionLabels[customer.region] ?? customer.region,
    })),
    products: products.map((product) => ({ value: product.id, label: product.name })),
  }
})
