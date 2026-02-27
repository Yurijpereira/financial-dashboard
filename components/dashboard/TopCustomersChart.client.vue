<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'

interface CustomerData {
  id: string
  name: string
  revenue: number
  orders: number
}

interface Props {
  data: CustomerData[]
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

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
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
  if (!chartInstance || props.loading || !props.data || props.data.length === 0) return

  const totalRevenue = props.data.reduce((sum, item) => sum + item.revenue, 0)
  
  const chartData = props.data.map(customer => ({
    name: customer.name,
    value: customer.revenue,
    percentage: (customer.revenue / totalRevenue) * 100,
    orders: customer.orders,
  }))

  const colors = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0']

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
      formatter: (params: any) => {
        return `
          <div style="font-size: 12px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
            <div style="color: #6b7280; margin-bottom: 2px;">
              ${formatCurrency(params.value)}
            </div>
            <div style="color: #6b7280; font-size: 11px;">
              ${params.data.orders} pedidos • ${formatPercentage(params.data.percentage)}
            </div>
          </div>
        `
      },
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: {
        color: '#374151',
        fontSize: 12,
      },
      itemWidth: 12,
      itemHeight: 12,
      formatter: (name: string) => {
        const item = chartData.find(d => d.name === name)
        if (!item) return name
        return `${name}\n${formatPercentage(item.percentage)}`
      },
    },
    series: [
      {
        name: 'Receita',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        padAngle: 2,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#374151',
            formatter: (params: any) => {
              return `${formatPercentage(params.data.percentage)}`
            },
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
        data: chartData,
        color: colors,
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
