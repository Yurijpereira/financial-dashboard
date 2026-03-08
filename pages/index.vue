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

const { data, pending, isFetching, error, refresh } = useFinancialSummaryQuery()
const { formatCurrencyBRL, formatInteger } = useFormatters()
</script>

<template>
  <section class="flex flex-col gap-6">
    <ClientOnly>
      <FilterBar />
    </ClientOnly>

    <div
      v-if="pending"
      class="flex flex-col gap-6"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          label="Faturamento no período"
          value-formatted=""
          loading
        />
        <KpiCard
          label="Pedidos faturados"
          value-formatted=""
          loading
        />
        <KpiCard
          label="Ticket médio"
          value-formatted=""
          loading
        />
      </div>

      <Card>
        <template #title>
          <div class="h-5 bg-gray-200 rounded w-48 animate-pulse" />
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          </div>
        </template>
      </Card>

      <Card>
        <template #title>
          <div class="h-5 bg-gray-200 rounded w-40 animate-pulse" />
        </template>
        <template #content>
          <ChartSkeleton height="300px" />
        </template>
      </Card>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <template #title>
            <div class="h-5 bg-gray-200 rounded w-44 animate-pulse" />
          </template>
          <template #content>
            <ChartSkeleton height="320px" />
          </template>
        </Card>
        <Card>
          <template #title>
            <div class="h-5 bg-gray-200 rounded w-32 animate-pulse" />
          </template>
          <template #content>
            <ChartSkeleton height="300px" />
          </template>
        </Card>
      </div>
    </div>

    <div
      v-else-if="error"
      class="card-base border border-red-200"
    >
      <p class="text-sm text-red-700 font-medium">Não foi possível carregar os dados.</p>
      <p class="text-sm text-gray-500 mt-1">Tente novamente em instantes.</p>
      <Button
        label="Tentar novamente"
        icon="pi pi-refresh"
        class="p-button-sm p-button-outlined mt-3"
        @click="refresh()"
      />
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
            :compare-enabled="data.kpis.revenue.variationPercentage !== null"
            :loading="isFetching"
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
              :loading="isFetching"
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
                :loading="isFetching"
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
                :loading="isFetching"
              />
            </ClientOnly>
          </template>
        </Card>
      </div>
    </template>

    <DataEmptyState
      v-else
      icon="pi pi-database"
      message="Nenhum dado disponível para o período selecionado."
    />
  </section>
</template>
