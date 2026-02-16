import { ref, onMounted } from 'vue'

/**
 * Composable para detectar se estamos no cliente
 * Útil para evitar problemas de hidratação SSR/Cliente
 * 
 * @returns {Ref<boolean>} isClient - true quando no cliente, false no servidor
 * 
 * @example
 * const { isClient } = useClientOnly()
 * 
 * // No template
 * <div v-if="isClient">
 *   <!-- Conteúdo apenas do cliente -->
 * </div>
 */
export function useClientOnly() {
  const isClient = ref(false)

  onMounted(() => {
    isClient.value = true
  })

  return {
    isClient,
  }
}
