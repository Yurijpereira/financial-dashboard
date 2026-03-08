<script setup lang="ts">
withDefaults(
  defineProps<{
    height?: string
  }>(),
  {
    height: '300px',
  },
)
</script>

<template>
  <div
    class="flex items-end gap-3 px-8 pb-8 pt-4 animate-pulse"
    :style="{ height }"
  >
    <div
      class="flex-1 bg-gray-200 rounded-t"
      style="height: 60%"
    />
    <div
      class="flex-1 bg-gray-200 rounded-t"
      style="height: 85%"
    />
    <div
      class="flex-1 bg-gray-200 rounded-t"
      style="height: 45%"
    />
    <div
      class="flex-1 bg-gray-200 rounded-t"
      style="height: 70%"
    />
    <div
      class="flex-1 bg-gray-200 rounded-t"
      style="height: 55%"
    />
    <div
      class="flex-1 bg-gray-200 rounded-t"
      style="height: 90%"
    />
    <div
      class="flex-1 bg-gray-200 rounded-t"
      style="height: 40%"
    />
    <div
      class="flex-1 bg-gray-200 rounded-t"
      style="height: 75%"
    />
  </div>
</template>
