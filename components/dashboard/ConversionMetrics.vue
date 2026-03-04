<script setup lang="ts">
import { useFormatters } from '@/composables/useFormatters'

interface ConversionMetric {
  label: string
  value: number
  total: number
  previousValue?: number
}

interface Props {
  metrics: ConversionMetric[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const { formatInteger } = useFormatters()

function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

function calculateTrend(current: number, previous: number | undefined): number | null {
  if (previous === undefined || previous === 0) return null
  return ((current - previous) / previous) * 100
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

function getTrendColor(trend: number | null): string {
  if (trend === null) return 'text-gray-500'
  return trend >= 0 ? 'text-emerald-600' : 'text-red-600'
}

function getTrendIcon(trend: number | null): string {
  if (trend === null) return ''
  return trend >= 0 ? '↑' : '↓'
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="(metric, index) in metrics"
      :key="index"
      class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
    >
      <div class="flex flex-col h-full">
        <div class="text-sm text-gray-600 mb-3">
          {{ metric.label }}
        </div>

        <div class="flex-1">
          <div class="flex items-baseline gap-2 mb-2">
            <span class="text-2xl font-bold text-gray-900">
              {{ formatPercentage(calculatePercentage(metric.value, metric.total)) }}
            </span>
            
            <span
              v-if="metric.previousValue !== undefined"
              :class="getTrendColor(calculateTrend(
                calculatePercentage(metric.value, metric.total),
                metric.previousValue ? calculatePercentage(metric.previousValue, metric.total) : undefined
              ))"
              class="text-xs font-medium"
            >
              {{ getTrendIcon(calculateTrend(
                calculatePercentage(metric.value, metric.total),
                metric.previousValue ? calculatePercentage(metric.previousValue, metric.total) : undefined
              )) }}
              {{
                metric.previousValue
                  ? Math.abs(calculateTrend(
                      calculatePercentage(metric.value, metric.total),
                      calculatePercentage(metric.previousValue, metric.total)
                    ) || 0).toFixed(1)
                  : '0.0'
              }}%
            </span>
          </div>

          <div class="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div
              class="bg-emerald-600 h-2 rounded-full transition-all duration-500 ease-out"
              :style="{ width: `${calculatePercentage(metric.value, metric.total)}%` }"
            />
          </div>

          <div class="text-xs text-gray-500">
            {{ formatInteger(metric.value) }} de {{ formatInteger(metric.total) }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="loading"
      class="col-span-full flex items-center justify-center py-8"
    >
      <p class="text-sm text-gray-500">Carregando métricas...</p>
    </div>
  </div>
</template>
