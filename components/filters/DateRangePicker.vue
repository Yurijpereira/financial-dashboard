<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { DateRange } from '@/types/filters'
import { useFilters } from '@/composables/useFilters'
import { formatToDisplayDate, getDaysDifference } from '@/utils/dateHelpers'

const { filters, setDateRange } = useFilters()

const selectedDates = ref<Date[]>([])

onMounted(() => {
  updateSelectedDates(filters.value.dateRange)
})

function updateSelectedDates(range: DateRange) {
  const [year1, month1, day1] = range.start.split('-').map(Number) as [number, number, number]
  const [year2, month2, day2] = range.end.split('-').map(Number) as [number, number, number]

  selectedDates.value = [
    new Date(year1, month1 - 1, day1),
    new Date(year2, month2 - 1, day2),
  ]
}

watch(
  () => filters.value.dateRange,
  (range) => {
    updateSelectedDates(range)
  },
  { flush: 'post' }
)

function handleDateSelect(dates: Date | Date[] | (Date | null)[] | null | undefined): void {
  if (!dates || !Array.isArray(dates) || dates.length !== 2) return

  const [start, end] = dates
  if (!start || !end) return

  const startISO = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
  const endISO = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`

  setDateRange({ start: startISO, end: endISO })
}

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
      <DatePicker
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
