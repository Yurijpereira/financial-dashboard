<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string
    message?: string
  }>(),
  {
    icon: 'pi pi-chart-bar',
    message: 'Nenhum dado encontrado para o período selecionado.',
  },
)
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-gray-400">
    <i
      :class="icon"
      class="text-4xl mb-3"
    />
    <p class="text-sm text-gray-500 text-center max-w-xs">
      {{ message }}
    </p>
  </div>
</template>
