export default defineEventHandler(() => {
  return {
    kpis: {
      revenue: { value: 120453, variationPercentage: 12.5 },
      billedOrders: { value: 184, variationPercentage: -3.1 },
      averageTicket: { value: 654.2, variationPercentage: 0 },
    },
    salesSeries: [
      { date: '2025-12-01', value: 8200 },
      { date: '2025-12-02', value: 9100 },
      { date: '2025-12-03', value: 7600 },
      { date: '2025-12-04', value: 10400 },
      { date: '2025-12-05', value: 9800 },
    ],
    topCustomers: [
      { id: 'c_1', name: 'Avanti LTDA', revenue: 21500, orders: 12 },
      { id: 'c_2', name: 'GLTextil', revenue: 17200, orders: 9 },
      { id: 'c_3', name: 'Northwind', revenue: 14800, orders: 8 },
    ],
  }
})
