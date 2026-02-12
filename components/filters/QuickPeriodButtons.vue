<script setup lang="ts">
import type { PeriodPreset } from '@/types/filters'
import { useFilters } from '@/composables/useFilters'

const { filters, setPreset } = useFilters()

interface PeriodOption {
  value: PeriodPreset
  label: string
  icon: string
}

const periods: PeriodOption[] = [
  { value: 'today', label: 'Hoje', icon: 'pi pi-calendar' },
  { value: '7days', label: '7 dias', icon: 'pi pi-calendar' },
  { value: '30days', label: '30 dias', icon: 'pi pi-calendar' },
  { value: '90days', label: '90 dias', icon: 'pi pi-calendar' },
  { value: 'mtd', label: 'Mês atual', icon: 'pi pi-calendar-month' },
  { value: 'ytd', label: 'Ano atual', icon: 'pi pi-calendar-times' },
]

function selectPeriod(preset: PeriodPreset): void {
  setPreset(preset)
}

function isActive(preset: PeriodPreset): boolean {
  return filters.value.preset === preset
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <PButton
      v-for="period in periods"
      :key="period.value"
      :label="period.label"
      :icon="period.icon"
      :class="[
        'text-sm',
        isActive(period.value)
          ? 'p-button-primary'
          : 'p-button-outlined p-button-secondary',
      ]"
      @click="selectPeriod(period.value)"
    />
  </div>
</template>
