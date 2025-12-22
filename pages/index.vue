<script setup lang="ts">
import Card from 'primevue/card'

import KpiCard from '@/components/dashboard/KpiCard.vue'
import { useFinancialSummaryQuery } from '@/composables/useFinancialSummaryQuery'

const { data, isPending, isError } = useFinancialSummaryQuery()

function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <div
      v-if="isPending"
      class="card-base"
    >
      <p class="text-sm text-gray-500">
        Carregando dados do dashboard...
      </p>
    </div>

    <div
      v-else-if="isError"
      class="card-base border border-red-200"
    >
      <p class="text-sm text-red-700 font-medium">
        Não foi possível carregar os dados.
      </p>
      <p class="text-sm text-gray-500 mt-1">
        Tente novamente em instantes.
      </p>
    </div>

    <template v-else-if="data">
      <!-- KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          label="Faturamento no período"
          :valueFormatted="formatCurrencyBRL(data.kpis.revenue.value)"
          :variationPercentage="data.kpis.revenue.variationPercentage"
        />

        <KpiCard
          label="Pedidos faturados"
          :valueFormatted="formatInteger(data.kpis.billedOrders.value)"
          :variationPercentage="data.kpis.billedOrders.variationPercentage"
        />

        <KpiCard
          label="Ticket médio"
          :valueFormatted="formatCurrencyBRL(data.kpis.averageTicket.value)"
          :variationPercentage="data.kpis.averageTicket.variationPercentage"
        />
      </div>

      <!-- Cards principais -->
      <div class="grid grid-cols-1 lg:grid-cols-[2fr,1.5fr] gap-4">
        <Card>
          <template #title>
            <h3 class="text-lg font-semibold">Vendas por período</h3>
          </template>

          <template #content>
            <ul class="mt-3 text-sm text-gray-700 space-y-1">
              <li
                v-for="salePoint in data.salesSeries"
                :key="salePoint.date"
                class="flex items-center justify-between"
              >
                <span class="text-gray-500">{{ salePoint.date }}</span>
                <span class="font-medium">{{ formatCurrencyBRL(salePoint.value) }}</span>
              </li>
            </ul>
          </template>
        </Card>

        <Card>
          <template #title>
            <h3 class="text-lg font-semibold">Top clientes</h3>
          </template>

          <template #content>
            <ul class="mt-3 text-sm text-gray-700 space-y-2">
              <li
                v-for="customer in data.topCustomers"
                :key="customer.id"
                class="flex items-start justify-between gap-3"
              >
                <div class="flex flex-col">
                  <span class="font-medium">{{ customer.name }}</span>
                  <span class="text-gray-500">
                    {{ formatInteger(customer.orders) }} pedidos
                  </span>
                </div>

                <span class="font-semibold">
                  {{ formatCurrencyBRL(customer.revenue) }}
                </span>
              </li>
            </ul>
          </template>
        </Card>
      </div>
    </template>

    <div
      v-else
      class="card-base"
    >
      <p class="text-sm text-gray-500">
        Nenhum dado disponível.
      </p>
    </div>
  </section>
</template>
