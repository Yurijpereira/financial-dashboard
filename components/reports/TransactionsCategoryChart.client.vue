<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsType, ECElementEvent } from 'echarts'
import type { ReportChartMetric, ReportTransactionCategory } from '@/types/reports'
import { REPORT_CATEGORY_LABELS } from '@/types/reports'

interface Props {
  metrics: ReportChartMetric<ReportTransactionCategory>[]
  selectedCategory?: ReportTransactionCategory | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedCategory: null,
  loading: false,
})

const emit = defineEmits<{
  'select-category': [value: ReportTransactionCategory]
}>()

const chartContainer = ref<HTMLDivElement | null>(null)
let chartInstance: EChartsType | null = null

type CategoryChartData = {
  value: number
  category: ReportTransactionCategory
  label: string
  transactionsCount: number
  itemStyle: {
    color: string
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

function isCategoryChartData(value: unknown): value is CategoryChartData {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<CategoryChartData>
  return (
    typeof candidate.value === 'number' &&
    typeof candidate.label === 'string' &&
    typeof candidate.transactionsCount === 'number' &&
    typeof candidate.category === 'string' &&
    candidate.category in REPORT_CATEGORY_LABELS
  )
}

function initChart(): void {
  if (!chartContainer.value) return

  if (chartContainer.value.clientWidth === 0 || chartContainer.value.clientHeight === 0) {
    setTimeout(() => initChart(), 100)
    return
  }

  chartInstance = echarts.init(chartContainer.value)
  chartInstance.on('click', (params: ECElementEvent) => {
    if (!isCategoryChartData(params.data)) return
    emit('select-category', params.data.category)
  })

  renderChart()
}

function renderChart(): void {
  if (!chartInstance) return

  if (!props.metrics.length) {
    chartInstance.clear()
    return
  }

  const data: CategoryChartData[] = props.metrics.map((metric) => ({
    value: metric.totalAmount,
    category: metric.key,
    label: REPORT_CATEGORY_LABELS[metric.key],
    transactionsCount: metric.transactionsCount,
    itemStyle: {
      color:
        props.selectedCategory && props.selectedCategory === metric.key ? '#1d4ed8' : '#2563eb',
    },
  }))

  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '12%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: Array<{ data?: unknown }>) => {
        const firstParam = params[0]
        if (!firstParam || !isCategoryChartData(firstParam.data)) {
          return ''
        }

        const item = firstParam.data
        return `
          <div style="font-size: 12px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${item.label}</div>
            <div>${formatCurrency(item.value)}</div>
            <div style="color: #6b7280; margin-top: 2px;">${item.transactionsCount} transações</div>
          </div>
        `
      },
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.label),
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#4b5563',
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#4b5563',
        formatter: (value: number) => `R$ ${(value / 1000).toFixed(0)}k`,
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        data,
        type: 'bar',
        barMaxWidth: 50,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
        },
      },
    ],
  }

  chartInstance.setOption(option)
}

function handleResize(): void {
  chartInstance?.resize()
}

onMounted(async () => {
  await nextTick()
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

watch(
  () => [props.metrics, props.selectedCategory, props.loading],
  () => {
    if (props.loading) return
    renderChart()
  },
  { deep: true },
)
</script>

<template>
  <div
    class="relative w-full"
    style="height: 320px"
  >
    <div
      v-if="loading && metrics.length === 0"
      class="absolute inset-0 z-10"
    >
      <ChartSkeleton height="320px" />
    </div>

    <div
      v-else-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-white/60 rounded z-10"
    >
      <i class="pi pi-spin pi-spinner text-2xl text-gray-400" />
    </div>

    <DataEmptyState
      v-else-if="metrics.length === 0"
      class="absolute inset-0 z-10"
      icon="pi pi-chart-bar"
      message="Sem dados de categorias para os filtros aplicados."
    />

    <div
      v-show="metrics.length > 0"
      ref="chartContainer"
      class="w-full h-full"
    />
  </div>
</template>
