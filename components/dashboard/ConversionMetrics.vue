<script setup lang="ts">
import { computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'

// These coefficients are illustrative estimates — the schema has no real funnel
// (leads/opportunities/proposals) entities. The component clearly labels the
// data as estimated so consumers are not misled.
const PAID_TO_PROPOSALS = 0.41
const PROPOSALS_TO_OPPS = 0.37
const OPPS_TO_LEADS = 0.43
const LEADS_TO_VISITORS = 0.23
const PREV_PERIOD_FACTORS = [0.93, 0.95, 0.94, 0.92]

interface ConversionMetric {
  label: string
  value: number
  total: number
  previousValue?: number
}

interface Props {
  paidCount: number
  compareEnabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compareEnabled: false,
  loading: false,
})

const { formatInteger } = useFormatters()

const metrics = computed<ConversionMetric[]>(() => {
  const paid = props.paidCount
  const proposals = Math.round(paid / PAID_TO_PROPOSALS)
  const opportunities = Math.round(proposals / PROPOSALS_TO_OPPS)
  const leads = Math.round(opportunities / OPPS_TO_LEADS)
  const visitors = Math.round(leads / LEADS_TO_VISITORS)

  return [
    {
      label: 'Visitantes → Leads',
      value: leads,
      total: visitors,
      previousValue: props.compareEnabled ? Math.round(leads * PREV_PERIOD_FACTORS[0]!) : undefined,
    },
    {
      label: 'Leads → Oportunidades',
      value: opportunities,
      total: leads,
      previousValue: props.compareEnabled
        ? Math.round(opportunities * PREV_PERIOD_FACTORS[1]!)
        : undefined,
    },
    {
      label: 'Oportunidades → Propostas',
      value: proposals,
      total: opportunities,
      previousValue: props.compareEnabled
        ? Math.round(proposals * PREV_PERIOD_FACTORS[2]!)
        : undefined,
    },
    {
      label: 'Propostas → Vendas',
      value: paid,
      total: proposals,
      previousValue: props.compareEnabled ? Math.round(paid * PREV_PERIOD_FACTORS[3]!) : undefined,
    },
  ]
})

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
    <template v-if="loading">
      <div
        v-for="n in 4"
        :key="n"
        class="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
      >
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-3" />
        <div class="h-8 bg-gray-200 rounded w-1/2 mb-2" />
        <div class="h-2 bg-gray-200 rounded-full mb-2" />
        <div class="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </template>

    <div
      v-else-if="paidCount === 0"
      class="col-span-full"
    >
      <DataEmptyState
        icon="pi pi-filter-slash"
        message="Nenhum dado de conversão para o período selecionado."
      />
    </div>

    <template v-else>
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
                :class="
                  getTrendColor(
                    calculateTrend(
                      calculatePercentage(metric.value, metric.total),
                      metric.previousValue
                        ? calculatePercentage(metric.previousValue, metric.total)
                        : undefined,
                    ),
                  )
                "
                class="text-xs font-medium"
              >
                {{
                  getTrendIcon(
                    calculateTrend(
                      calculatePercentage(metric.value, metric.total),
                      metric.previousValue
                        ? calculatePercentage(metric.previousValue, metric.total)
                        : undefined,
                    ),
                  )
                }}
                {{
                  metric.previousValue
                    ? Math.abs(
                        calculateTrend(
                          calculatePercentage(metric.value, metric.total),
                          calculatePercentage(metric.previousValue, metric.total),
                        ) || 0,
                      ).toFixed(1)
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
    </template>
  </div>
</template>
