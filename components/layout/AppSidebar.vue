<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

type SidebarNavigationItem = {
  label: string
  to: string
  iconClassName: string
}

const currentRoute = useRoute()

const navigationItems = computed<SidebarNavigationItem[]>(() => [
  {
    label: 'Dashboard',
    to: '/',
    iconClassName: 'pi pi-home',
  },
  {
    label: 'Relatórios',
    to: '/reports',
    iconClassName: 'pi pi-file',
  },
  {
    label: 'Configurações',
    to: '/settings',
    iconClassName: 'pi pi-cog',
  },
])

function isNavigationItemActive(navigationPath: string): boolean {
  if (navigationPath === '/') {
    return currentRoute.path === '/'
  }

  return currentRoute.path === navigationPath || currentRoute.path.startsWith(`${navigationPath}/`)
}

function getNavigationItemClassName(navigationPath: string): string {
  const isActive = isNavigationItemActive(navigationPath)

  if (isActive) {
    return 'bg-indigo-50 text-indigo-600 font-medium'
  }

  return 'text-gray-600 hover:bg-gray-100'
}
</script>

<template>
  <aside class="w-60 bg-white border-r border-gray-200 p-4 flex flex-col gap-6">
    <div class="flex items-center gap-2 font-semibold text-lg">
      <i class="pi pi-chart-line text-indigo-500 text-xl" />
      <span>FinDash</span>
    </div>

    <nav class="flex flex-col gap-1">
      <NuxtLink
        v-for="navigationItem in navigationItems"
        :key="navigationItem.to"
        :to="navigationItem.to"
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
        :class="getNavigationItemClassName(navigationItem.to)"
      >
        <i :class="[navigationItem.iconClassName, 'text-sm']" />
        <span>{{ navigationItem.label }}</span>
      </NuxtLink>
    </nav>
  </aside>
</template>
