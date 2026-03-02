import { z } from 'zod'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const SummaryQuerySchema = z.object({
  startDate: z.string().regex(ISO_DATE, 'Data inválida (esperado: YYYY-MM-DD)').optional(),
  endDate: z.string().regex(ISO_DATE, 'Data inválida (esperado: YYYY-MM-DD)').optional(),
  customers: z.string().max(1_000).optional(),
  regions: z.string().max(1_000).optional(),
  products: z.string().max(1_000).optional(),
  compareWithPrevious: z.enum(['true', 'false']).default('false'),
})

export default defineEventHandler(async (event) => {
  const raw = getQuery(event)
  const result = SummaryQuerySchema.safeParse(raw)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Parâmetros inválidos',
      data: result.error.issues,
    })
  }

  const { customers, regions, products, compareWithPrevious } = result.data

  const customerList = customers ? customers.split(',').map(s => s.trim()).filter(Boolean) : []
  const regionList = regions ? regions.split(',').map(s => s.trim()).filter(Boolean) : []
  const productList = products ? products.split(',').map(s => s.trim()).filter(Boolean) : []

  const hasFilters = customerList.length > 0 || regionList.length > 0 || productList.length > 0
  const filterMultiplier = hasFilters ? 0.7 : 1
  const compare = compareWithPrevious === 'true'

  const previousMultiplier = 0.85

  try {
    return {
      kpis: {
        revenue: {
          value: Math.round(120453 * filterMultiplier),
          variationPercentage: hasFilters ? 8.2 : 12.5,
          previousValue: compare ? Math.round(120453 * filterMultiplier * previousMultiplier) : undefined,
        },
        billedOrders: {
          value: Math.round(184 * filterMultiplier),
          variationPercentage: hasFilters ? -1.5 : -3.1,
          previousValue: compare ? Math.round(184 * filterMultiplier * 1.05) : undefined,
        },
        averageTicket: {
          value: Math.round(654.2 * (hasFilters ? 1.1 : 1)),
          variationPercentage: hasFilters ? 2.3 : 0,
          previousValue: compare ? Math.round(654.2 * (hasFilters ? 1.1 : 1) * 0.95) : undefined,
        },
      },
      salesSeries: [
        { date: '2025-12-01', value: Math.round(8200 * filterMultiplier), previousValue: compare ? Math.round(8200 * filterMultiplier * previousMultiplier) : undefined },
        { date: '2025-12-02', value: Math.round(9100 * filterMultiplier), previousValue: compare ? Math.round(9100 * filterMultiplier * previousMultiplier) : undefined },
        { date: '2025-12-03', value: Math.round(7600 * filterMultiplier), previousValue: compare ? Math.round(7600 * filterMultiplier * previousMultiplier) : undefined },
        { date: '2025-12-04', value: Math.round(10400 * filterMultiplier), previousValue: compare ? Math.round(10400 * filterMultiplier * previousMultiplier) : undefined },
        { date: '2025-12-05', value: Math.round(9800 * filterMultiplier), previousValue: compare ? Math.round(9800 * filterMultiplier * previousMultiplier) : undefined },
        { date: '2025-12-06', value: Math.round(11200 * filterMultiplier), previousValue: compare ? Math.round(11200 * filterMultiplier * previousMultiplier) : undefined },
        { date: '2025-12-07', value: Math.round(10100 * filterMultiplier), previousValue: compare ? Math.round(10100 * filterMultiplier * previousMultiplier) : undefined },
      ],
      topCustomers: [
        { id: 'c_1', name: 'Tech Solutions Brasil', revenue: Math.round(21500 * filterMultiplier), orders: Math.round(12 * filterMultiplier) },
        { id: 'c_2', name: 'Investimentos LTDA.', revenue: Math.round(17200 * filterMultiplier), orders: Math.round(9 * filterMultiplier) },
        { id: 'c_3', name: 'Fintech Empresarial', revenue: Math.round(14800 * filterMultiplier), orders: Math.round(8 * filterMultiplier) },
        { id: 'c_4', name: 'Consultoria Digital', revenue: Math.round(12300 * filterMultiplier), orders: Math.round(7 * filterMultiplier) },
        { id: 'c_5', name: 'Grupo Inovação', revenue: Math.round(9800 * filterMultiplier), orders: Math.round(5 * filterMultiplier) },
      ],
      monthlyComparison: [
        { month: 'Ago', revenue: Math.round(98000 * filterMultiplier), orders: Math.round(145 * filterMultiplier), target: 95000 },
        { month: 'Set', revenue: Math.round(105000 * filterMultiplier), orders: Math.round(158 * filterMultiplier), target: 100000 },
        { month: 'Out', revenue: Math.round(112000 * filterMultiplier), orders: Math.round(167 * filterMultiplier), target: 110000 },
        { month: 'Nov', revenue: Math.round(108000 * filterMultiplier), orders: Math.round(162 * filterMultiplier), target: 115000 },
        { month: 'Dez', revenue: Math.round(125000 * filterMultiplier), orders: Math.round(189 * filterMultiplier), target: 120000 },
        { month: 'Jan', revenue: Math.round(118000 * filterMultiplier), orders: Math.round(178 * filterMultiplier), target: 125000 },
      ],
      conversionMetrics: [
        { label: 'Visitantes → Leads', value: Math.round(2850 * filterMultiplier), total: 12400, previousValue: 2650 },
        { label: 'Leads → Oportunidades', value: Math.round(1240 * filterMultiplier), total: Math.round(2850 * filterMultiplier), previousValue: 1180 },
        { label: 'Oportunidades → Propostas', value: Math.round(456 * filterMultiplier), total: Math.round(1240 * filterMultiplier), previousValue: 428 },
        { label: 'Propostas → Vendas', value: 189, total: 456, previousValue: 175 },
      ],
    }
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno ao processar dados',
    })
  }
})
