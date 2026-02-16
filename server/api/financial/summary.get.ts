export default defineEventHandler((event) => {
  // Obtém os query params dos filtros
  const query = getQuery(event)
  const startDate = query.startDate as string | undefined
  const endDate = query.endDate as string | undefined
  const customers = query.customers ? (query.customers as string).split(',') : []
  const regions = query.regions ? (query.regions as string).split(',') : []
  const products = query.products ? (query.products as string).split(',') : []
  const compareWithPrevious = query.compareWithPrevious === 'true'

  // Log para debug (em produção, usar logger apropriado)
  console.log('API Filters:', { startDate, endDate, customers, regions, products, compareWithPrevious })

  // Em produção, aqui faria queries no banco de dados com os filtros
  // Por ora, retornamos dados mockados que variam baseado nos filtros

  // Simula variação nos dados baseado nos filtros aplicados
  const hasFilters = customers.length > 0 || regions.length > 0 || products.length > 0
  const filterMultiplier = hasFilters ? 0.7 : 1 // Reduz 30% se houver filtros ativos

  // Dados do período anterior (para comparação) - 15% menores em média
  const previousMultiplier = 0.85

  return {
    kpis: {
      revenue: { 
        value: Math.round(120453 * filterMultiplier), 
        variationPercentage: hasFilters ? 8.2 : 12.5,
        previousValue: compareWithPrevious ? Math.round(120453 * filterMultiplier * previousMultiplier) : undefined
      },
      billedOrders: { 
        value: Math.round(184 * filterMultiplier), 
        variationPercentage: hasFilters ? -1.5 : -3.1,
        previousValue: compareWithPrevious ? Math.round(184 * filterMultiplier * 1.05) : undefined
      },
      averageTicket: { 
        value: Math.round(654.2 * (hasFilters ? 1.1 : 1)), 
        variationPercentage: hasFilters ? 2.3 : 0,
        previousValue: compareWithPrevious ? Math.round(654.2 * (hasFilters ? 1.1 : 1) * 0.95) : undefined
      },
    },
    salesSeries: [
      { 
        date: '2025-12-01', 
        value: Math.round(8200 * filterMultiplier),
        previousValue: compareWithPrevious ? Math.round(8200 * filterMultiplier * previousMultiplier) : undefined
      },
      { 
        date: '2025-12-02', 
        value: Math.round(9100 * filterMultiplier),
        previousValue: compareWithPrevious ? Math.round(9100 * filterMultiplier * previousMultiplier) : undefined
      },
      { 
        date: '2025-12-03', 
        value: Math.round(7600 * filterMultiplier),
        previousValue: compareWithPrevious ? Math.round(7600 * filterMultiplier * previousMultiplier) : undefined
      },
      { 
        date: '2025-12-04', 
        value: Math.round(10400 * filterMultiplier),
        previousValue: compareWithPrevious ? Math.round(10400 * filterMultiplier * previousMultiplier) : undefined
      },
      { 
        date: '2025-12-05', 
        value: Math.round(9800 * filterMultiplier),
        previousValue: compareWithPrevious ? Math.round(9800 * filterMultiplier * previousMultiplier) : undefined
      },
      { 
        date: '2025-12-06', 
        value: Math.round(11200 * filterMultiplier),
        previousValue: compareWithPrevious ? Math.round(11200 * filterMultiplier * previousMultiplier) : undefined
      },
      { 
        date: '2025-12-07', 
        value: Math.round(10100 * filterMultiplier),
        previousValue: compareWithPrevious ? Math.round(10100 * filterMultiplier * previousMultiplier) : undefined
      },
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
      {
        label: 'Visitantes → Leads',
        value: Math.round(2850 * filterMultiplier),
        total: 12400,
        previousValue: 2650,
      },
      {
        label: 'Leads → Oportunidades',
        value: Math.round(1240 * filterMultiplier),
        total: Math.round(2850 * filterMultiplier),
        previousValue: 1180,
      },
      {
        label: 'Oportunidades → Propostas',
        value: Math.round(456 * filterMultiplier),
        total: Math.round(1240 * filterMultiplier),
        previousValue: 428,
      },
      {
        label: 'Propostas → Vendas',
        value: 189,
        total: 456,
        previousValue: 175,
      },
    ],
  }
})
