import type { SavedView } from '@/types/filters'

const STORAGE_KEY = 'financial-dashboard-saved-views'

/**
 * Carrega saved views do localStorage (client-only)
 */
export function loadViewsFromStorage(): SavedView[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored) as SavedView[]
  } catch (error) {
    console.warn('Failed to load saved views from localStorage:', error)
    return []
  }
}

/**
 * Salva views no localStorage (client-only)
 */
export function saveViewsToStorage(views: SavedView[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(views))
  } catch (error) {
    console.warn('Failed to save views to localStorage:', error)
  }
}
