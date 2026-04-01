import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ALL_WIDGET_IDS } from '@/types/dashboard'
import { normalizeLayout, useDashboardLayoutStore } from '@/stores/dashboardLayout'

describe('useDashboardLayoutStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('keeps only the first occurrence of each stored widget and appends missing widgets', () => {
    const normalizedLayout = normalizeLayout({
      widgets: [
        { id: 'sales-chart', visible: false },
        { id: 'sales-chart', visible: true },
        { id: 'top-customers', visible: false },
      ],
    })

    const orderedWidgetIds = normalizedLayout.widgets.map((widget) => widget.id)

    expect(orderedWidgetIds).toEqual([
      'sales-chart',
      'top-customers',
      ...ALL_WIDGET_IDS.filter((widgetId) => !['sales-chart', 'top-customers'].includes(widgetId)),
    ])
    expect(orderedWidgetIds).toHaveLength(ALL_WIDGET_IDS.length)
    expect(new Set(orderedWidgetIds).size).toBe(orderedWidgetIds.length)
    expect(normalizedLayout.widgets.find((widget) => widget.id === 'sales-chart')?.visible).toBe(
      false,
    )
    expect(normalizedLayout.widgets.find((widget) => widget.id === 'top-customers')?.visible).toBe(
      false,
    )
  })

  it('updates widget visibility from the explicit emitted value without toggling back', () => {
    const store = useDashboardLayoutStore()

    store.setWidgetVisibility('sales-chart', false)
    store.setWidgetVisibility('sales-chart', false)

    expect(store.layout.widgets.find((widget) => widget.id === 'sales-chart')?.visible).toBe(false)
  })
})
