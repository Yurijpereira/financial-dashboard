<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { DateRange } from '@/types/filters'
import { useFilters } from '@/composables/useFilters'
import { formatToDisplayDate, getDaysDifference } from '@/utils/dateHelpers'

const { filters, setDateRange } = useFilters()

// Converte string ISO para Date para o DatePicker component
const selectedDates = ref<Date[]>([])
const isClient = ref(false)

// Garante que só inicializa no cliente
onMounted(() => {
  isClient.value = true
  updateSelectedDates(filters.value.dateRange)
})

// Função para atualizar as datas selecionadas
function updateSelectedDates(range: DateRange) {
  if (!isClient.value) return
  
  // Usa UTC para evitar problemas de timezone
  const startDate = new Date(range.start)
  const endDate = new Date(range.end)
  
  selectedDates.value = [startDate, endDate]
}

// Inicializa as datas selecionadas
watch(
  () => filters.value.dateRange,
  (range) => {
    updateSelectedDates(range)
  },
  { flush: 'post' }
)

// Quando o usuário seleciona datas no DatePicker
function handleDateSelect(dates: Date | Date[] | (Date | null)[] | null | undefined): void {
  if (!dates || !Array.isArray(dates) || dates.length !== 2) return

  const [start, end] = dates
  if (!start || !end) return

  // Formata para ISO string (YYYY-MM-DD) usando UTC
  const year1 = start.getFullYear()
  const month1 = String(start.getMonth() + 1).padStart(2, '0')
  const day1 = String(start.getDate()).padStart(2, '0')
  const startISO = `${year1}-${month1}-${day1}`
  
  const year2 = end.getFullYear()
  const month2 = String(end.getMonth() + 1).padStart(2, '0')
  const day2 = String(end.getDate()).padStart(2, '0')
  const endISO = `${year2}-${month2}-${day2}`

  setDateRange({ start: startISO, end: endISO })
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
      <ClientOnly>
        <DatePicker
          v-if="isClient"
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
        <template #fallback>
          <div class="w-full max-w-sm h-10 bg-gray-100 animate-pulse rounded"></div>
        </template>
      </ClientOnly>

      <div
        v-if="isClient"
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
      v-if="isClient && filters.preset === 'custom'"
      class="text-xs text-gray-500 flex items-center gap-1"
    >
      <i class="pi pi-calendar" />
      Período personalizado selecionado
    </p>
  </div>
</template>
