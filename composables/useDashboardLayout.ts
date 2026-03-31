import { storeToRefs } from 'pinia'
import { useDashboardLayoutStore } from '@/stores/dashboardLayout'

export function useDashboardLayout() {
  const store = useDashboardLayoutStore()
  const { layout, visibleWidgets, orderedWidgets } = storeToRefs(store)

  return {
    layout,
    visibleWidgets,
    orderedWidgets,
    toggleWidget: store.toggleWidget,
    moveWidget: store.moveWidget,
    resetLayout: store.resetLayout,
  }
}
