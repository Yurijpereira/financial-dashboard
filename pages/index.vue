<script setup lang="ts">
import Card from 'primevue/card'
</script>

<template>
  <section class="flex flex-col gap-6">
    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <KpiCard
        label="Faturamento no período"
        valueFormatted="R$ 120.453,00"
        :variationPercentage="12.5"
      />
      <KpiCard
        label="Pedidos faturados"
        valueFormatted="184"
        :variationPercentage="-3.1"
      />
      <KpiCard
        label="Ticket médio"
        valueFormatted="R$ 654,20"
        :variationPercentage="5.7"
      />
    </div>

    <!-- Cards principais (gráfico + top clientes) -->
    <div class="grid grid-cols-1 lg:grid-cols-[2fr,1.5fr] gap-4">
      <Card>
        <template #title>
          <h3 class="text-lg font-semibold">Vendas por período</h3>
        </template>
        <template #content>
          <p class="text-sm text-gray-500">
            Gráfico de vendas (em construção – depois entra ECharts aqui)
          </p>
        </template>
      </Card>

      <Card>
        <template #title>
          <h3 class="text-lg font-semibold">Top clientes</h3>
        </template>
        <template #content>
          <p class="text-sm text-gray-500">
            Tabela de clientes (em construção – depois entra DataTable aqui)
          </p>
        </template>
      </Card>
    </div>
  </section>
</template>
