export type DashboardWidgetId =
  | 'kpi-revenue'
  | 'kpi-billed-orders'
  | 'kpi-average-ticket'
  | 'conversion-funnel'
  | 'sales-chart'
  | 'monthly-comparison'
  | 'top-customers'

export type DashboardWidgetMeta = {
  label: string
  icon: string
}

export type DashboardWidgetConfig = {
  id: DashboardWidgetId
  visible: boolean
}

export type DashboardLayoutConfig = {
  widgets: DashboardWidgetConfig[]
}

export const DASHBOARD_WIDGETS_META: Record<DashboardWidgetId, DashboardWidgetMeta> = {
  'kpi-revenue': { label: 'Faturamento no período', icon: 'pi pi-dollar' },
  'kpi-billed-orders': { label: 'Pedidos faturados', icon: 'pi pi-shopping-cart' },
  'kpi-average-ticket': { label: 'Ticket médio', icon: 'pi pi-chart-line' },
  'conversion-funnel': { label: 'Funil de Conversão', icon: 'pi pi-filter' },
  'sales-chart': { label: 'Vendas por período', icon: 'pi pi-chart-bar' },
  'monthly-comparison': { label: 'Comparação Mensal', icon: 'pi pi-chart-bar' },
  'top-customers': { label: 'Top Clientes', icon: 'pi pi-users' },
}

export const ALL_WIDGET_IDS: readonly DashboardWidgetId[] = [
  'kpi-revenue',
  'kpi-billed-orders',
  'kpi-average-ticket',
  'conversion-funnel',
  'sales-chart',
  'monthly-comparison',
  'top-customers',
]

export function createDefaultLayout(): DashboardLayoutConfig {
  return {
    widgets: ALL_WIDGET_IDS.map((id) => ({ id, visible: true })),
  }
}
