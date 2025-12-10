<script setup lang="ts">
// Os componentes são auto-importados pelo Nuxt 3
</script>

<template>
  <div class="flex min-h-screen">
    <AppSidebar />

    <div class="flex flex-col flex-1">
      <AppHeader />

      <main class="p-6 bg-gray-50 flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>
