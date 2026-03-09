<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'
import { useFormatters } from '@/composables/useFormatters'

interface SalesDataPoint {
  date: string
  value: number
}

interface Props {
  data: SalesDataPoint[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const chartContainer = ref<HTMLDivElement | null>(null)
let chartInstance: EChartsType | null = null

const { formatCurrencyBRL } = useFormatters()

type TooltipParam = {
  name: string
  value: number
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

function initChart() {
  if (!chartContainer.value) return

  const width = chartContainer.value.clientWidth
  const height = chartContainer.value.clientHeight

  if (width === 0 || height === 0) {
    setTimeout(() => initChart(), 100)
    return
  }

  chartInstance = echarts.init(chartContainer.value)
  updateChart()
}

function updateChart() {
  if (!chartInstance) return

  if (props.loading || !props.data || props.data.length === 0) {
    chartInstance.clear()
    return
  }

  const dates = props.data.map((item) => formatDate(item.date))
  const values = props.data.map((item) => item.value)

  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
      formatter: (params: TooltipParam[]) => {
        const param = params[0]
        if (!param) return ''
        return `
          <div style="font-size: 12px;">
            <div style="color: #6b7280; margin-bottom: 4px;">${param.name}</div>
            <div style="font-weight: 600; color: #059669; font-size: 14px;">
              ${formatCurrencyBRL(param.value)}
            </div>
          </div>
        `
      },
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        formatter: (value: number) => {
          return `R$ ${(value / 1000).toFixed(0)}k`
        },
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
        name: 'Vendas',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: values,
        lineStyle: {
          color: '#059669',
          width: 3,
        },
        itemStyle: {
          color: '#059669',
          borderColor: '#fff',
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(5, 150, 105, 0.3)' },
              { offset: 1, color: 'rgba(5, 150, 105, 0.05)' },
            ],
          },
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: '#047857',
            shadowBlur: 10,
            shadowColor: 'rgba(5, 150, 105, 0.5)',
          },
        },
      },
    ],
  }

  chartInstance.setOption(option)
}

function handleResize() {
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

watch(() => props.data, updateChart, { deep: true })
watch(() => props.loading, updateChart)
</script>

<template>
  <div
    class="relative w-full"
    style="min-height: 300px; height: 300px"
  >
    <div
      v-if="loading && (!data || data.length === 0)"
      class="absolute inset-0 z-10"
    >
      <ChartSkeleton height="300px" />
    </div>

    <div
      v-else-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-white/60 rounded z-10"
    >
      <i class="pi pi-spin pi-spinner text-2xl text-gray-400" />
    </div>

    <DataEmptyState
      v-else-if="!data || data.length === 0"
      class="absolute inset-0 z-10"
      icon="pi pi-chart-line"
      message="Nenhuma venda encontrada para o período selecionado."
    />

    <div
      v-show="data && data.length > 0"
      ref="chartContainer"
      class="w-full h-full"
    />
  </div>
</template>
