<script setup lang="ts">
import type { NuxtError } from '#app'
import Button from 'primevue/button'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => props.error.statusCode ?? 500)

const title = computed(() => {
  if (statusCode.value === 404) return 'Página não encontrada'
  if (statusCode.value === 403) return 'Acesso negado'
  if (statusCode.value === 401) return 'Não autenticado'
  return 'Algo deu errado'
})

const description = computed(() => {
  if (statusCode.value === 404) return 'A página que você procura não existe ou foi movida.'
  if (statusCode.value === 403) return 'Você não tem permissão para acessar este recurso.'
  if (statusCode.value === 401) return 'Faça login para continuar.'
  return 'Ocorreu um erro inesperado. Tente novamente em instantes.'
})

const icon = computed(() => {
  if (statusCode.value === 404) return 'pi pi-search'
  if (statusCode.value === 403) return 'pi pi-ban'
  if (statusCode.value === 401) return 'pi pi-lock'
  return 'pi pi-exclamation-triangle'
})

function handleBack(): void {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="text-center max-w-md">
      <div class="mb-6">
        <i :class="[icon, 'text-5xl text-gray-400']" />
      </div>
      <p class="text-6xl font-bold text-gray-300 mb-2">{{ statusCode }}</p>
      <h1 class="text-xl font-semibold text-gray-900 mb-2">{{ title }}</h1>
      <p class="text-sm text-gray-500 mb-8">{{ description }}</p>
      <Button
        label="Voltar ao início"
        icon="pi pi-home"
        @click="handleBack"
      />
    </div>
  </div>
</template>
