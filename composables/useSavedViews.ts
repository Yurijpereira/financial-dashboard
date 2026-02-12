import { ref, computed } from 'vue'
import type { SavedView, SavedViewInput, DashboardFilters } from '@/types/filters'

/**
 * Gera um ID único para uma view
 */
function generateId(): string {
  return `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Estado global das views salvas
const savedViews = ref<SavedView[]>([])
let isInitialized = false

/**
 * Composable para gerenciar visualizações salvas do dashboard
 */
export function useSavedViews() {
  // Inicializa as views do localStorage apenas uma vez (client-side)
  if (!isInitialized && process.client) {
    // Importação dinâmica do código client-only
    import('./useSavedViews.client').then(({ loadViewsFromStorage, saveViewsToStorage }) => {
      savedViews.value = loadViewsFromStorage()
      
      // Exporta função para salvar (usada pelos métodos abaixo)
      ;(globalThis as any).__saveViewsToStorage = saveViewsToStorage
    })
    isInitialized = true
  }
  
  // Helper para salvar (funciona tanto no server quanto no client)
  const persistViews = (views: SavedView[]) => {
    if (process.client && (globalThis as any).__saveViewsToStorage) {
      ;(globalThis as any).__saveViewsToStorage(views)
    }
  }

  /**
   * Cria uma nova view salva
   */
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

  /**
   * Atualiza uma view existente
   */
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

  /**
   * Deleta uma view
   */
  function deleteView(id: string): boolean {
    const index = savedViews.value.findIndex((v) => v.id === id)
    if (index === -1) return false

    savedViews.value.splice(index, 1)
    persistViews(savedViews.value)
    return true
  }

  /**
   * Busca uma view por ID
   */
  function getViewById(id: string): SavedView | undefined {
    return savedViews.value.find((v) => v.id === id)
  }

  /**
   * Aplica uma view salva aos filtros atuais
   */
  function applyView(id: string): DashboardFilters | null {
    const view = getViewById(id)
    if (!view) return null

    return { ...view.filters }
  }

  /**
   * Verifica se já existe uma view com o mesmo nome
   */
  function hasViewWithName(name: string, excludeId?: string): boolean {
    return savedViews.value.some(
      (v) => v.name.toLowerCase() === name.toLowerCase() && v.id !== excludeId
    )
  }

  /**
   * Ordena views por data de atualização (mais recentes primeiro)
   */
  const sortedViews = computed(() => {
    return [...savedViews.value].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  })

  /**
   * Conta quantas views estão salvas
   */
  const viewsCount = computed(() => savedViews.value.length)

  /**
   * Verifica se há views salvas
   */
  const hasViews = computed(() => savedViews.value.length > 0)

  return {
    // Estado
    savedViews: computed(() => savedViews.value),
    sortedViews,
    viewsCount,
    hasViews,

    // Ações
    createView,
    updateView,
    deleteView,
    getViewById,
    applyView,
    hasViewWithName,
  }
}
