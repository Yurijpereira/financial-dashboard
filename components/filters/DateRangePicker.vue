<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { DateRange } from '@/types/filters'
import { useFilters } from '@/composables/useFilters'
import { formatToDisplayDate, getDaysDifference } from '@/utils/dateHelpers'

const { filters, setDateRange } = useFilters()

// Converte string ISO para Date para o Calendar component
const selectedDates = ref<Date[]>([])

// Inicializa as datas selecionadas
watch(
  () => filters.value.dateRange,
  (range) => {
    selectedDates.value = [
      new Date(range.start + 'T00:00:00'),
      new Date(range.end + 'T00:00:00'),
    ]
  },
  { immediate: true }
)

// Quando o usuário seleciona datas no calendar
function handleDateSelect(dates: Date | Date[] | null): void {
  if (!dates || !Array.isArray(dates) || dates.length !== 2) return

  const [start, end] = dates
  if (!start || !end) return

  // Formata para ISO string (YYYY-MM-DD)
  const startParts = start.toISOString().split('T')
  const endParts = end.toISOString().split('T')
  
  if (!startParts[0] || !endParts[0]) return

  setDateRange({ start: startParts[0], end: endParts[0] })
}

// Informações sobre o período selecionado
const periodInfo = computed(() => {
  const range = filters.value.dateRange
  const days = getDaysDifference(range.start, range.end) + 1

  return {
    start: formatToDisplayDate(range.start),
    end: formatToDisplayDate(range.end),
    days,
    label: `${days} ${days === 1 ? 'dia' : 'dias'}`,
  }
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-3">
      <Calendar
        v-model="selectedDates"
        selection-mode="range"
        :manual-input="false"
        date-format="dd/mm/yy"
        show-icon
        icon-display="input"
        placeholder="Selecione o período"
        class="w-full max-w-sm"
        @update:model-value="handleDateSelect"
      />

      <div
        class="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
      >
        <i class="pi pi-info-circle text-gray-500" />
        <span class="text-gray-700">
          <strong>{{ periodInfo.label }}</strong>
        </span>
        <span class="text-gray-500">
          ({{ periodInfo.start }} - {{ periodInfo.end }})
        </span>
      </div>
    </div>

    <p
      v-if="filters.preset === 'custom'"
      class="text-xs text-gray-500 flex items-center gap-1"
    >
      <i class="pi pi-calendar" />
      Período personalizado selecionado
    </p>
  </div>
</template>
