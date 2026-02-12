<script setup lang="ts">
import { computed } from 'vue'
import { useFilters } from '@/composables/useFilters'
import { getDaysDifference, formatToDisplayDate } from '@/utils/dateHelpers'

const { filters, toggleCompareWithPrevious } = useFilters()

/**
 * Calcula o período anterior baseado no período atual
 */
const previousPeriod = computed(() => {
  const currentRange = filters.value.dateRange
  const daysDiff = getDaysDifference(currentRange.start, currentRange.end)

  // Calcula o período anterior com a mesma duração usando string manipulation
  const [year, month, day] = currentRange.start.split('-').map(Number)
  const startDate = new Date(year!, month! - 1, day!)
  
  // Subtrai 1 dia para obter o fim do período anterior
  const previousEndDate = new Date(startDate)
  previousEndDate.setDate(previousEndDate.getDate() - 1)
  
  // Subtrai a duração do período para obter o início
  const previousStartDate = new Date(previousEndDate)
  previousStartDate.setDate(previousStartDate.getDate() - daysDiff)
  
  // Formata para ISO
  const previousEnd = previousEndDate.getFullYear() + '-' + 
    String(previousEndDate.getMonth() + 1).padStart(2, '0') + '-' + 
    String(previousEndDate.getDate()).padStart(2, '0')
  
  const previousStart = previousStartDate.getFullYear() + '-' + 
    String(previousStartDate.getMonth() + 1).padStart(2, '0') + '-' + 
    String(previousStartDate.getDate()).padStart(2, '0')

  return {
    start: previousStart,
    end: previousEnd,
    days: daysDiff + 1,
  }
})

/**
 * Descrição do período de comparação
 */
const comparisonDescription = computed(() => {
  const prev = previousPeriod.value
  if (!prev.start || !prev.end) return ''
  return `${formatToDisplayDate(prev.start)} - ${formatToDisplayDate(prev.end)}`
})
</script>

<template>
  <div class="flex flex-col gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
    <div class="flex items-start gap-3">
      <Checkbox
        :model-value="filters.compareWithPrevious"
        binary
        input-id="compare-toggle"
        @update:model-value="toggleCompareWithPrevious"
      />

      <div class="flex-1">
        <label
          for="compare-toggle"
          class="text-sm font-medium text-gray-900 cursor-pointer"
        >
          Comparar com período anterior
        </label>

        <p
          v-if="filters.compareWithPrevious"
          class="text-xs text-gray-600 mt-1"
        >
          Comparando com: <strong>{{ comparisonDescription }}</strong>
          ({{ previousPeriod.days }} {{ previousPeriod.days === 1 ? 'dia' : 'dias' }})
        </p>
      </div>

      <i
        class="pi pi-chart-line text-purple-600"
        style="font-size: 1.25rem"
      />
    </div>

    <p
      v-if="filters.compareWithPrevious"
      class="text-xs text-purple-700 bg-purple-100 px-3 py-2 rounded"
    >
      <i class="pi pi-info-circle mr-1" />
      Os indicadores mostrarão variação percentual em relação ao período anterior
    </p>
  </div>
</template>
