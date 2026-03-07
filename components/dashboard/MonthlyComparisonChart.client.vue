<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'
import { useFormatters } from '@/composables/useFormatters'

interface MonthlyData {
  month: string
  revenue: number
  orders: number
  target?: number
}

interface Props {
  data: MonthlyData[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const chartContainer = ref<HTMLDivElement | null>(null)
let chartInstance: EChartsType | null = null

const { formatCurrencyBRL } = useFormatters()

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
  if (!chartInstance || props.loading || !props.data || props.data.length === 0) return

  const months = props.data.map((item) => item.month)
  const revenues = props.data.map((item) => item.revenue)
  const orders = props.data.map((item) => item.orders)
  const targets = props.data.map((item) => item.target || 0)

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
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
      formatter: (params: any) => {
        let tooltip = `<div style="font-size: 12px;">
          <div style="font-weight: 600; margin-bottom: 6px;">${params[0].name}</div>`

        params.forEach((param: any) => {
          const color = param.color
          if (param.seriesName === 'Receita' || param.seriesName === 'Meta') {
            tooltip += `
              <div style="display: flex; align-items: center; margin-bottom: 3px;">
                <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; border-radius: 2px; margin-right: 6px;"></span>
                <span style="color: #6b7280; margin-right: 8px;">${param.seriesName}:</span>
                <span style="font-weight: 600;">${formatCurrencyBRL(param.value)}</span>
              </div>`
          } else if (param.seriesName === 'Pedidos') {
            tooltip += `
              <div style="display: flex; align-items: center;">
                <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; border-radius: 2px; margin-right: 6px;"></span>
                <span style="color: #6b7280; margin-right: 8px;">${param.seriesName}:</span>
                <span style="font-weight: 600;">${param.value}</span>
              </div>`
          }
        })

        tooltip += '</div>'
        return tooltip
      },
    },
    legend: {
      data: ['Receita', 'Meta', 'Pedidos'],
      top: '0%',
      textStyle: {
        color: '#374151',
        fontSize: 12,
      },
      itemWidth: 12,
      itemHeight: 12,
    },
    xAxis: {
      type: 'category',
      data: months,
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
    yAxis: [
      {
        type: 'value',
        name: 'Receita',
        position: 'left',
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
      {
        type: 'value',
        name: 'Pedidos',
        position: 'right',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: 'Receita',
        type: 'bar',
        data: revenues,
        itemStyle: {
          color: '#059669',
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: '#047857',
          },
        },
        barMaxWidth: 40,
      },
      {
        name: 'Meta',
        type: 'line',
        data: targets,
        lineStyle: {
          color: '#f59e0b',
          width: 2,
          type: 'dashed',
        },
        itemStyle: {
          color: '#f59e0b',
        },
        symbol: 'circle',
        symbolSize: 6,
      },
      {
        name: 'Pedidos',
        type: 'line',
        yAxisIndex: 1,
        data: orders,
        lineStyle: {
          color: '#3b82f6',
          width: 2,
        },
        itemStyle: {
          color: '#3b82f6',
        },
        symbol: 'circle',
        symbolSize: 6,
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
    style="min-height: 320px; height: 320px"
  >
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
