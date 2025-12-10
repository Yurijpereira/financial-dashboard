<script setup lang="ts">
import Button from 'primevue/button'
</script>

<template>
  <header
    class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200"
  >
    <div class="flex flex-col gap-1">
      <span class="text-lg font-semibold">Financial Dashboard</span>
      <span class="text-sm text-gray-500">
        Visão geral de desempenho financeiro
      </span>
    </div>

    <div class="flex items-center gap-2">
      <Button
        icon="pi pi-refresh"
        class="p-button-text"
        label="Atualizar dados"
      />
      <Button
        icon="pi pi-user"
        class="p-button-rounded p-button-text"
        aria-label="Perfil"
      />
    </div>
  </header>
</template>
