<script setup lang="ts">
import Card from 'primevue/card'

import KpiCard from '@/components/dashboard/KpiCard.vue'
import ConversionMetrics from '@/components/dashboard/ConversionMetrics.vue'
import FilterBar from '@/components/filters/FilterBar.vue'
import SalesChart from '@/components/dashboard/SalesChart.client.vue'
import TopCustomersChart from '@/components/dashboard/TopCustomersChart.client.vue'
import MonthlyComparisonChart from '@/components/dashboard/MonthlyComparisonChart.client.vue'
import { useFinancialSummaryQuery } from '@/composables/useFinancialSummaryQuery'
import { useFormatters } from '@/composables/useFormatters'

const { data, pending, error } = useFinancialSummaryQuery()
const { formatCurrencyBRL, formatInteger } = useFormatters()
</script>

<template>
  <section class="flex flex-col gap-6">
    <ClientOnly>
      <FilterBar />
    </ClientOnly>

    <div
      v-if="pending"
      class="card-base"
    >
      <p class="text-sm text-gray-500">Carregando dados do dashboard...</p>
    </div>

    <div
      v-else-if="error"
      class="card-base border border-red-200"
    >
      <p class="text-sm text-red-700 font-medium">Não foi possível carregar os dados.</p>
      <p class="text-sm text-gray-500 mt-1">Tente novamente em instantes.</p>
    </div>

    <template v-else-if="data">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          label="Faturamento no período"
          :value-formatted="formatCurrencyBRL(data.kpis.revenue.value)"
          :variation-percentage="data.kpis.revenue.variationPercentage"
        />

        <KpiCard
          label="Pedidos faturados"
          :value-formatted="formatInteger(data.kpis.billedOrders.value)"
          :variation-percentage="data.kpis.billedOrders.variationPercentage"
        />

        <KpiCard
          label="Ticket médio"
          :value-formatted="formatCurrencyBRL(data.kpis.averageTicket.value)"
          :variation-percentage="data.kpis.averageTicket.variationPercentage"
        />
      </div>

      <Card>
        <template #title>
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-semibold">Funil de Conversão</h3>
            <span
              class="text-xs font-normal text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5"
            >
              Estimado</span
            >
          </div>
        </template>

        <template #content>
          <ConversionMetrics
            :paid-count="data.paidTransactionsCount"
            :compare-enabled="!!data.kpis.revenue.variationPercentage"
            :loading="pending"
          />
        </template>
      </Card>

      <Card>
        <template #title>
          <h3 class="text-lg font-semibold">Vendas por período</h3>
        </template>

        <template #content>
          <ClientOnly>
            <SalesChart
              :data="data.salesSeries"
              :loading="pending"
            />
          </ClientOnly>
        </template>
      </Card>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <template #title>
            <h3 class="text-lg font-semibold">Comparação Mensal</h3>
          </template>

          <template #content>
            <ClientOnly>
              <MonthlyComparisonChart
                :data="data.monthlyComparison"
                :loading="pending"
              />
            </ClientOnly>
          </template>
        </Card>

        <Card>
          <template #title>
            <h3 class="text-lg font-semibold">Top Clientes</h3>
          </template>

          <template #content>
            <ClientOnly>
              <TopCustomersChart
                :data="data.topCustomers"
                :loading="pending"
              />
            </ClientOnly>
          </template>
        </Card>
      </div>
    </template>

    <div
      v-else
      class="card-base"
    >
      <p class="text-sm text-gray-500">Nenhum dado disponível.</p>
    </div>
  </section>
</template>
