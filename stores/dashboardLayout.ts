import { defineStore } from 'pinia'
import { ref, computed, watch, nextTick } from 'vue'
import type {
  DashboardLayoutConfig,
  DashboardWidgetConfig,
  DashboardWidgetId,
} from '@/types/dashboard'
import { ALL_WIDGET_IDS, createDefaultLayout } from '@/types/dashboard'

const STORAGE_KEY = 'financial-dashboard-layout'
const DEBOUNCE_DELAY = 300

const VALID_WIDGET_IDS = new Set<string>(ALL_WIDGET_IDS)

function isValidWidgetConfig(value: unknown): value is DashboardWidgetConfig {
  if (!value || typeof value !== 'object') return false
  const config = value as Partial<DashboardWidgetConfig>
  return (
    typeof config.id === 'string' &&
    VALID_WIDGET_IDS.has(config.id) &&
    typeof config.visible === 'boolean'
  )
}

function isValidLayoutConfig(value: unknown): value is DashboardLayoutConfig {
  if (!value || typeof value !== 'object') return false
  const config = value as Partial<DashboardLayoutConfig>
  return Array.isArray(config.widgets) && config.widgets.every(isValidWidgetConfig)
}

export function normalizeLayout(stored: DashboardLayoutConfig): DashboardLayoutConfig {
  const normalizedWidgetIds = new Set<DashboardWidgetId>()
  const normalized: DashboardWidgetConfig[] = []

  for (const storedWidget of stored.widgets) {
    if (!VALID_WIDGET_IDS.has(storedWidget.id) || normalizedWidgetIds.has(storedWidget.id)) {
      continue
    }

    normalizedWidgetIds.add(storedWidget.id)
    normalized.push(storedWidget)
  }

  for (const id of ALL_WIDGET_IDS) {
    if (!normalizedWidgetIds.has(id)) {
      normalized.push({ id, visible: true })
    }
  }

  return { widgets: normalized }
}

export const useDashboardLayoutStore = defineStore('dashboardLayout', () => {
  const layout = ref<DashboardLayoutConfig>(createDefaultLayout())
  let saveTimeout: ReturnType<typeof setTimeout> | null = null

  if (import.meta.client) {
    nextTick(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed: unknown = JSON.parse(raw)
          if (isValidLayoutConfig(parsed)) {
            layout.value = normalizeLayout(parsed)
          }
        }
      } catch {
        return
      }
    })

    watch(
      layout,
      (val) => {
        if (saveTimeout) clearTimeout(saveTimeout)

        saveTimeout = setTimeout(() => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
          } catch (error) {
            console.error('[DashboardLayout] Failed to save:', error)
          }
        }, DEBOUNCE_DELAY)
      },
      { deep: true, flush: 'post' },
    )
  }

  const visibleWidgets = computed(() => layout.value.widgets.filter((w) => w.visible))

  const orderedWidgets = computed(() => layout.value.widgets)

  function setWidgetVisibility(id: DashboardWidgetId, visible: boolean): void {
    const widget = layout.value.widgets.find((w) => w.id === id)
    if (widget && widget.visible !== visible) {
      widget.visible = visible
    }
  }

  function moveWidget(fromIndex: number, toIndex: number): void {
    const widgets = layout.value.widgets
    if (fromIndex < 0 || fromIndex >= widgets.length || toIndex < 0 || toIndex >= widgets.length) {
      return
    }
    const [moved] = widgets.splice(fromIndex, 1)
    widgets.splice(toIndex, 0, moved!)
  }

  function resetLayout(): void {
    layout.value = createDefaultLayout()
  }

  return {
    layout,
    visibleWidgets,
    orderedWidgets,
    setWidgetVisibility,
    moveWidget,
    resetLayout,
  }
})
