import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { SavedView, SavedViewInput, DashboardFilters } from '@/types/filters'

const STORAGE_KEY = 'financial-dashboard-saved-views'

const PERIOD_PRESETS = new Set([
  'today', '7days', '30days', '90days', 'mtd', 'ytd', 'custom',
])

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isValidDateRange(value: unknown): value is DashboardFilters['dateRange'] {
  if (!value || typeof value !== 'object') return false
  const d = value as Partial<DashboardFilters['dateRange']>
  return typeof d.start === 'string' && typeof d.end === 'string'
}

function isDashboardFilters(value: unknown): value is DashboardFilters {
  if (!value || typeof value !== 'object') return false
  const f = value as Partial<DashboardFilters>
  return (
    isValidDateRange(f.dateRange) &&
    typeof f.preset === 'string' &&
    PERIOD_PRESETS.has(f.preset) &&
    isStringArray(f.customers) &&
    isStringArray(f.regions) &&
    isStringArray(f.products) &&
    typeof f.compareWithPrevious === 'boolean'
  )
}

function isSavedView(value: unknown): value is SavedView {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<SavedView>
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    isDashboardFilters(v.filters) &&
    typeof v.createdAt === 'string' &&
    typeof v.updatedAt === 'string'
  )
}

function generateId(): string {
  return `view_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

export const useSavedViewsStore = defineStore('savedViews', () => {
  const views = ref<SavedView[]>([])

  if (import.meta.client) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        views.value = (Array.isArray(parsed) ? parsed : []).filter(isSavedView)
      }
    } catch {}

    watch(views, (val) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      } catch {}
    }, { deep: true, flush: 'post' })
  }

  function createView(input: SavedViewInput): SavedView {
    const now = new Date().toISOString()
    const newView: SavedView = {
      id: generateId(),
      name: input.name,
      filters: { ...input.filters },
      createdAt: now,
      updatedAt: now,
    }
    views.value.push(newView)
    return newView
  }

  function updateView(id: string, input: Partial<SavedViewInput>): boolean {
    const index = views.value.findIndex((v) => v.id === id)
    if (index === -1) return false
    const view = views.value[index]!
    if (input.name !== undefined) view.name = input.name
    if (input.filters !== undefined) view.filters = { ...input.filters }
    view.updatedAt = new Date().toISOString()
    return true
  }

  function deleteView(id: string): boolean {
    const index = views.value.findIndex((v) => v.id === id)
    if (index === -1) return false
    views.value.splice(index, 1)
    return true
  }

  function getViewById(id: string): SavedView | undefined {
    return views.value.find((v) => v.id === id)
  }

  function applyView(id: string): DashboardFilters | null {
    const view = getViewById(id)
    if (!view) return null
    return { ...view.filters }
  }

  function hasViewWithName(name: string, excludeId?: string): boolean {
    return views.value.some(
      (v) => v.name.toLowerCase() === name.toLowerCase() && v.id !== excludeId,
    )
  }

  const sortedViews = computed(() =>
    [...views.value].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    ),
  )

  const viewsCount = computed(() => views.value.length)
  const hasViews = computed(() => views.value.length > 0)

  return {
    views,
    sortedViews,
    viewsCount,
    hasViews,
    createView,
    updateView,
    deleteView,
    getViewById,
    applyView,
    hasViewWithName,
  }
})
