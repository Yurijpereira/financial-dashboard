<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'

const { user, clear: clearSession } = useUserSession()
const { roleLabel } = useAuthorization()
const queryClient = useQueryClient()

async function refreshDashboardData(): Promise<void> {
  await queryClient.invalidateQueries()
}

async function handleLogout(): Promise<void> {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clearSession()
  await navigateTo('/login')
}
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
    <div class="flex flex-col gap-1">
      <span class="text-lg font-semibold">Financial Dashboard</span>
      <span class="text-sm text-gray-500"> Visão geral de desempenho financeiro </span>
    </div>

    <div class="flex items-center gap-3">
      <Button
        icon="pi pi-refresh"
        class="p-button-text"
        label="Atualizar dados"
        @click="refreshDashboardData"
      />

      <div
        v-if="user"
        class="flex items-center gap-2 text-sm text-gray-600"
      >
        <i class="pi pi-user" />
        <span>{{ user.name }}</span>
        <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
          {{ roleLabel }}
        </span>
      </div>

      <Button
        icon="pi pi-sign-out"
        class="p-button-rounded p-button-text"
        aria-label="Sair"
        @click="handleLogout"
      />
    </div>
  </header>
</template>
