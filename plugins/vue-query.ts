import type {
  DehydratedState,
  VueQueryPluginOptions,
} from '@tanstack/vue-query'
import {
  VueQueryPlugin,
  QueryClient,
  hydrate,
  dehydrate,
} from '@tanstack/vue-query'
// Nuxt 3 app aliases
import { useState } from '#app'

export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  // Modify your Vue Query global settings here
  const queryClient = new QueryClient({
    defaultOptions: { 
      queries: { 
        staleTime: 5000,
        refetchOnWindowFocus: false, // Evita refetch ao focar janela
        refetchOnMount: false, // Evita refetch ao montar componente
        refetchOnReconnect: false, // Evita refetch ao reconectar
        retry: 1, // Reduz tentativas de retry
      } 
    },
  })
  const options: VueQueryPluginOptions = { queryClient }

  nuxt.vueApp.use(VueQueryPlugin, options)

  if (process.server) {
    nuxt.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }

  if (process.client) {
    // Hydrate após o app estar montado
    if (vueQueryState.value) {
      hydrate(queryClient, vueQueryState.value)
    }
  }
})
