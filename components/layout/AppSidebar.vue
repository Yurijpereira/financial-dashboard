<script setup lang="ts">
</script>

<template>
  <aside
    class="w-60 bg-white border-r border-gray-200 p-4 flex flex-col gap-6"
  >
    <div class="flex items-center gap-2 font-semibold text-lg">
      <i class="pi pi-chart-line text-indigo-500 text-xl" />
      <span>FinDash</span>
    </div>

    <nav class="flex flex-col gap-1">
      <button
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-600"
      >
        <i class="pi pi-home text-sm" />
        <span>Dashboard</span>
      </button>

      <button
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
      >
        <i class="pi pi-file text-sm" />
        <span>Relatórios</span>
      </button>

      <button
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
      >
        <i class="pi pi-cog text-sm" />
        <span>Configurações</span>
      </button>
    </nav>
  </aside>
</template>
