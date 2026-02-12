<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'

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
const isClient = ref(false)
let chartInstance: EChartsType | null = null

function formatCurrency(value: number): string {
  if (!isClient.value) return `R$ ${value}`
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateString: string): string {
  if (!isClient.value) return dateString
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

function initChart() {
  if (!chartContainer.value) return

  // Verifica se o container tem dimensões
  const width = chartContainer.value.clientWidth
  const height = chartContainer.value.clientHeight
  
  if (width === 0 || height === 0) {
    // Tenta novamente após um pequeno delay
    setTimeout(() => initChart(), 100)
    return
  }

  chartInstance = echarts.init(chartContainer.value)
  updateChart()
}

function updateChart() {
  if (!chartInstance || props.loading || !props.data || props.data.length === 0) return

  const dates = props.data.map(item => formatDate(item.date))
  const values = props.data.map(item => item.value)

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
      formatter: (params: any) => {
        const param = params[0]
        return `
          <div style="font-size: 12px;">
            <div style="color: #6b7280; margin-bottom: 4px;">${param.name}</div>
            <div style="font-weight: 600; color: #059669; font-size: 14px;">
              ${formatCurrency(param.value)}
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
  isClient.value = true
  await nextTick()
  initChart()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
  chartInstance?.dispose()
})

watch(() => props.data, updateChart, { deep: true })
watch(() => props.loading, updateChart)
</script>

<template>
  <div class="relative w-full" style="min-height: 300px; height: 300px;">
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-gray-50 rounded z-10"
    >
      <p class="text-sm text-gray-500">Carregando gráfico...</p>
    </div>
    
    <div
      ref="chartContainer"
      class="w-full h-full"
      :class="{ 'opacity-30': loading }"
    />
  </div>
</template>
