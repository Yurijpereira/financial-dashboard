import { watch } from 'vue'
import type { DashboardFilters } from '@/types/filters'

const STORAGE_KEY = 'financial-dashboard-filters'

export function loadFiltersFromStorage(): DashboardFilters | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as DashboardFilters
  } catch (error) {
    console.warn('Failed to load filters from localStorage:', error)
    return null
  }
}

export function saveFiltersToStorage(filters: DashboardFilters): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  } catch (error) {
    console.warn('Failed to save filters to localStorage:', error)
  }
}

export function setupFiltersStorageWatcher(
  getFilters: () => DashboardFilters
): void {
  watch(
    getFilters,
    (newFilters) => {
      saveFiltersToStorage(newFilters)
    },
    { deep: true, flush: 'post' }
  )
}
