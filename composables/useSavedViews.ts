import { ref, computed } from 'vue'
import type { SavedView, SavedViewInput, DashboardFilters } from '@/types/filters'

const PERIOD_PRESETS = new Set([
  'today',
  '7days',
  '30days',
  '90days',
  'mtd',
  'ytd',
  'custom',
])

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isValidDateRange(value: unknown): value is DashboardFilters['dateRange'] {
  if (!value || typeof value !== 'object') {
    return false
  }

  const dateRange = value as Partial<DashboardFilters['dateRange']>
  return typeof dateRange.start === 'string' && typeof dateRange.end === 'string'
}

function isDashboardFilters(value: unknown): value is DashboardFilters {
  if (!value || typeof value !== 'object') {
    return false
  }

  const filters = value as Partial<DashboardFilters>
  return (
    isValidDateRange(filters.dateRange) &&
    typeof filters.preset === 'string' &&
    PERIOD_PRESETS.has(filters.preset) &&
    isStringArray(filters.customers) &&
    isStringArray(filters.regions) &&
    isStringArray(filters.products) &&
    typeof filters.compareWithPrevious === 'boolean'
  )
}

function isSavedView(value: unknown): value is SavedView {
  if (!value || typeof value !== 'object') {
    return false
  }

  const view = value as Partial<SavedView>
  return (
    typeof view.id === 'string' &&
    typeof view.name === 'string' &&
    isDashboardFilters(view.filters) &&
    typeof view.createdAt === 'string' &&
    typeof view.updatedAt === 'string'
  )
}

function generateId(): string {
  const timestamp = Date.now()
  const randomPart = Math.random().toString(36).substring(2, 11)
  return `view_${timestamp}_${randomPart}`
}

const savedViews = ref<SavedView[]>([])
let isInitialized = false

export function useSavedViews() {
  if (!isInitialized && import.meta.client) {
    import('./useSavedViews.client').then(({ loadViewsFromStorage, saveViewsToStorage }) => {
      savedViews.value = loadViewsFromStorage().filter(isSavedView)
      
      ;(globalThis as any).__saveViewsToStorage = saveViewsToStorage
    })
    isInitialized = true
  }
  
  const persistViews = (views: SavedView[]) => {
    if (import.meta.client && (globalThis as any).__saveViewsToStorage) {
      ;(globalThis as any).__saveViewsToStorage(views)
    }
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

    savedViews.value.push(newView)
    persistViews(savedViews.value)

    return newView
  }

  function updateView(id: string, input: Partial<SavedViewInput>): boolean {
    const index = savedViews.value.findIndex((v) => v.id === id)
    if (index === -1) return false

    const view = savedViews.value[index]
    if (!view) return false
    
    if (input.name !== undefined) {
      savedViews.value[index]!.name = input.name
    }
    
    if (input.filters !== undefined) {
      savedViews.value[index]!.filters = { ...input.filters }
    }

    savedViews.value[index]!.updatedAt = new Date().toISOString()

    persistViews(savedViews.value)
    return true
  }

  function deleteView(id: string): boolean {
    const index = savedViews.value.findIndex((v) => v.id === id)
    if (index === -1) return false

    savedViews.value.splice(index, 1)
    persistViews(savedViews.value)
    return true
  }

  function getViewById(id: string): SavedView | undefined {
    return savedViews.value.find((v) => v.id === id)
  }

  function applyView(id: string): DashboardFilters | null {
    const view = getViewById(id)
    if (!view) return null

    return { ...view.filters }
  }

  function hasViewWithName(name: string, excludeId?: string): boolean {
    return savedViews.value.some(
      (v) => v.name.toLowerCase() === name.toLowerCase() && v.id !== excludeId
    )
  }

  const sortedViews = computed(() => {
    return [...savedViews.value].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  })

  const viewsCount = computed(() => savedViews.value.length)

  const hasViews = computed(() => savedViews.value.length > 0)

  return {
    savedViews: computed(() => savedViews.value),
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
}
