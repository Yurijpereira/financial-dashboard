import type { DehydratedState, VueQueryPluginOptions } from '@tanstack/vue-query'
import { VueQueryPlugin, QueryClient, hydrate, dehydrate } from '@tanstack/vue-query'
import { useState } from '#app'

export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutos - aumentado para reduzir refetches
        gcTime: 1000 * 60 * 10, // 10 minutos (anteriormente cacheTime)
        refetchOnWindowFocus: false, // Evita refetch ao focar janela
        refetchOnMount: false, // Evita refetch ao montar componente
        refetchOnReconnect: false, // Evita refetch ao reconectar
        retry: 1, // Reduz tentativas de retry
        retryDelay: 1000, // Delay entre retries
      },
    },
  })
  const options: VueQueryPluginOptions = { queryClient }

  nuxt.vueApp.use(VueQueryPlugin, options)

  if (import.meta.server) {
    nuxt.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }

  if (import.meta.client) {
    nuxt.hooks.hook('app:mounted', () => {
      if (vueQueryState.value) {
        hydrate(queryClient, vueQueryState.value)
      }
    })
  }
})
