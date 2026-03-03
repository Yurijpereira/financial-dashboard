import { storeToRefs } from 'pinia'
import { useSavedViewsStore } from '@/stores/savedViews'

export function useSavedViews() {
  const store = useSavedViewsStore()
  const { views, sortedViews, viewsCount, hasViews } = storeToRefs(store)

  return {
    savedViews: views,
    sortedViews,
    viewsCount,
    hasViews,
    createView: store.createView,
    updateView: store.updateView,
    deleteView: store.deleteView,
    getViewById: store.getViewById,
    applyView: store.applyView,
    hasViewWithName: store.hasViewWithName,
  }
}
