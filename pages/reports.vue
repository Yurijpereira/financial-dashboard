<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import FilterBar from '@/components/filters/FilterBar.vue'
import ReportsAdvancedFilters from '@/components/reports/ReportsAdvancedFilters.vue'
import TransactionsCategoryChart from '@/components/reports/TransactionsCategoryChart.client.vue'
import TransactionsTable from '@/components/reports/TransactionsTable.vue'
import { useReportsFilters } from '@/composables/useReportsFilters'
import { useReportsTransactionsQuery } from '@/composables/useReportsTransactionsQuery'
import type {
  ReportSortField,
  ReportSortOrder,
  ReportTransaction,
  ReportTransactionCategory,
  ReportsAdvancedFilters as ReportsAdvancedFiltersState,
  ReportsTransactionsResponse,
} from '@/types/reports'
import { REPORT_CATEGORY_LABELS } from '@/types/reports'

const page = ref(1)
const pageSize = ref(15)
const sortField = ref<ReportSortField>('date')
const sortOrder = ref<ReportSortOrder>('desc')
const isExporting = ref(false)

const {
  advancedFilters,
  searchInput,
  debouncedSearch,
  hasActiveAdvancedFilters,
  apiQueryParams: advancedQueryParams,
  setAdvancedFilters,
  updateAdvancedFilters,
  resetAdvancedFilters,
} = useReportsFilters()

const { data, pending, error, queryParams } = useReportsTransactionsQuery({
  page,
  pageSize,
  sortField,
  sortOrder,
  search: debouncedSearch,
  advancedQueryParams,
})

const transactions = computed(() => data.value?.items ?? [])
const total = computed(() => data.value?.total ?? 0)
const summary = computed(() => {
  return (
    data.value?.summary ?? {
      totalAmount: 0,
      averageTicket: 0,
      totalTransactions: 0,
    }
  )
})

const categoryMetrics = computed(() => data.value?.metrics.byCategory ?? [])
const selectedCategory = computed<ReportTransactionCategory | null>(() => {
  return advancedFilters.value.categories.length === 1
    ? (advancedFilters.value.categories[0] ?? null)
    : null
})

const selectedCategoryLabel = computed(() => {
  if (!selectedCategory.value) return null
  return REPORT_CATEGORY_LABELS[selectedCategory.value]
})

watch([debouncedSearch, advancedQueryParams, sortField, sortOrder], () => {
  page.value = 1
})

watch([total, pageSize], () => {
  const maxPage = Math.max(1, Math.ceil(total.value / pageSize.value))
  if (page.value > maxPage) {
    page.value = maxPage
  }
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value)
}

function handleAdvancedFiltersUpdate(nextFilters: ReportsAdvancedFiltersState): void {
  setAdvancedFilters(nextFilters)
}

function handleCategoryDrilldown(category: ReportTransactionCategory): void {
  const categories = advancedFilters.value.categories

  if (categories.length === 1 && categories[0] === category) {
    updateAdvancedFilters({ categories: [] })
    return
  }

  updateAdvancedFilters({ categories: [category] })
}

function clearCategoryDrilldown(): void {
  updateAdvancedFilters({ categories: [] })
}

async function fetchTransactionsForExport(): Promise<ReportTransaction[]> {
  const response = await $fetch<ReportsTransactionsResponse>('/api/reports/transactions', {
    query: {
      ...queryParams.value,
      page: '1',
      pageSize: '5000',
    },
  })

  return response.items
}

async function exportData(format: 'excel' | 'pdf'): Promise<void> {
  if (isExporting.value || pending.value) return
  isExporting.value = true

  try {
    const exportItems = await fetchTransactionsForExport()
    if (exportItems.length === 0) return

    const exportTools = await import('@/utils/reportsExport.client')
    if (format === 'excel') {
      exportTools.exportTransactionsToExcel(exportItems)
      return
    }

    exportTools.exportTransactionsToPdf(exportItems)
  } finally {
    isExporting.value = false
  }
}

async function handleExportExcel(): Promise<void> {
  await exportData('excel')
}

async function handleExportPdf(): Promise<void> {
  await exportData('pdf')
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <ClientOnly>
      <FilterBar />
    </ClientOnly>

    <ReportsAdvancedFilters
      :filters="advancedFilters"
      :search="searchInput"
      :loading="pending"
      @update:filters="handleAdvancedFiltersUpdate"
      @update:search="(value) => (searchInput = value)"
      @reset="resetAdvancedFilters"
    />

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div class="card-base">
        <p class="text-sm text-gray-500">Transacoes filtradas</p>
        <p class="text-2xl font-semibold mt-1">{{ summary.totalTransactions }}</p>
      </div>

      <div class="card-base">
        <p class="text-sm text-gray-500">Valor total filtrado</p>
        <p class="text-2xl font-semibold mt-1">{{ formatCurrency(summary.totalAmount) }}</p>
      </div>

      <div class="card-base">
        <p class="text-sm text-gray-500">Ticket medio</p>
        <p class="text-2xl font-semibold mt-1">{{ formatCurrency(summary.averageTicket) }}</p>
      </div>

      <div class="card-base">
        <p class="text-sm text-gray-500">Exportacao</p>
        <div class="mt-3 flex gap-2">
          <Button
            label="Excel"
            icon="pi pi-file-excel"
            class="p-button-sm p-button-outlined"
            :disabled="pending || isExporting || total === 0"
            @click="handleExportExcel"
          />
          <Button
            label="PDF"
            icon="pi pi-file-pdf"
            class="p-button-sm p-button-outlined"
            :disabled="pending || isExporting || total === 0"
            @click="handleExportPdf"
          />
        </div>
      </div>
    </div>

    <Card>
      <template #title>
        <div class="flex items-center justify-between flex-wrap gap-2">
          <h2 class="text-lg font-semibold">Receita por categoria</h2>

          <div class="flex items-center gap-2">
            <span
              v-if="selectedCategoryLabel"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"
            >
              Drill-down: {{ selectedCategoryLabel }}
            </span>
            <Button
              v-if="selectedCategoryLabel"
              label="Remover drill-down"
              icon="pi pi-times"
              class="p-button-text p-button-sm"
              @click="clearCategoryDrilldown"
            />
          </div>
        </div>
      </template>

      <template #content>
        <ClientOnly>
          <TransactionsCategoryChart
            :metrics="categoryMetrics"
            :selected-category="selectedCategory"
            :loading="pending"
            @select-category="handleCategoryDrilldown"
          />
        </ClientOnly>
      </template>
    </Card>

    <Card>
      <template #title>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Transacoes detalhadas</h2>
          <span class="text-sm text-gray-500 mr-5">
            {{ hasActiveAdvancedFilters ? 'Filtros avancados ativos' : 'Visao geral' }}
          </span>
        </div>
      </template>

      <template #content>
        <div
          v-if="error"
          class="border border-red-200 bg-red-50 rounded-lg p-3 mb-4"
        >
          <p class="text-sm text-red-700">
            Falha ao carregar os relatórios. Tente novamente em alguns instantes.
          </p>
        </div>

        <TransactionsTable
          :items="transactions"
          :loading="pending"
          :total="total"
          :page="page"
          :page-size="pageSize"
          :sort-field="sortField"
          :sort-order="sortOrder"
          @update:page="(value) => (page = value)"
          @update:page-size="(value) => (pageSize = value)"
          @update:sort-field="(value) => (sortField = value)"
          @update:sort-order="(value) => (sortOrder = value)"
        />
      </template>
    </Card>
  </section>
</template>
