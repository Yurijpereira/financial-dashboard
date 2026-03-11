<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFormatters } from '@/composables/useFormatters'
import { useTransactionMutations } from '@/composables/useTransactionMutations'
import FilterBar from '@/components/filters/FilterBar.vue'
import ReportsAdvancedFilters from '@/components/reports/ReportsAdvancedFilters.vue'
import TransactionsCategoryChart from '@/components/reports/TransactionsCategoryChart.client.vue'
import TransactionsTable from '@/components/reports/TransactionsTable.vue'
import TransactionFormDialog from '@/components/reports/TransactionFormDialog.vue'
import TransactionDeleteDialog from '@/components/reports/TransactionDeleteDialog.vue'
import { useReportsFilters } from '@/composables/useReportsFilters'
import { useReportsTransactionsQuery } from '@/composables/useReportsTransactionsQuery'
import type {
  ReportSortField,
  ReportSortOrder,
  ReportTransaction,
  ReportTransactionCategory,
  ReportsAdvancedFilters as ReportsAdvancedFiltersState,
  TransactionFormData,
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

const { data, pending, isFetching, error, queryParams } = useReportsTransactionsQuery({
  page,
  pageSize,
  sortField,
  sortOrder,
  search: debouncedSearch,
  advancedQueryParams,
})

const toast = useAppToast()
const { canExportReports, canCreateTransaction, canUpdateTransaction, canDeleteTransaction } =
  useAuthorization()

const { createMutation, updateMutation, deleteMutation } = useTransactionMutations()

const showFormDialog = ref(false)
const showDeleteDialog = ref(false)
const editingTransaction = ref<ReportTransaction | null>(null)
const deletingTransaction = ref<ReportTransaction | null>(null)

const filterOptions = ref<{
  customers: { value: string; label: string }[]
  products: { value: string; label: string }[]
}>({
  customers: [],
  products: [],
})

const filterOptionsLoaded = ref(false)

async function ensureFilterOptions(): Promise<boolean> {
  if (filterOptionsLoaded.value) return true

  try {
    const options = await $fetch<{
      customers: { value: string; label: string }[]
      products: { value: string; label: string }[]
    }>('/api/filters/options')
    filterOptions.value = { customers: options.customers, products: options.products }
    filterOptionsLoaded.value = true
    return true
  } catch {
    toast.error({ detail: 'Falha ao carregar opções de filtro.' })
    return false
  }
}

function handleCreateTransaction(): void {
  editingTransaction.value = null
  ensureFilterOptions().then((ok) => {
    if (ok) showFormDialog.value = true
  })
}

function handleEditTransaction(transaction: ReportTransaction): void {
  editingTransaction.value = transaction
  ensureFilterOptions().then((ok) => {
    if (ok) showFormDialog.value = true
  })
}

function handleDeleteTransaction(transaction: ReportTransaction): void {
  deletingTransaction.value = transaction
  showDeleteDialog.value = true
}

const isMutating = computed(
  () =>
    createMutation.isPending.value ||
    updateMutation.isPending.value ||
    deleteMutation.isPending.value,
)

async function handleFormSave(formData: TransactionFormData): Promise<void> {
  try {
    if (editingTransaction.value) {
      await updateMutation.mutateAsync({ id: editingTransaction.value.id, data: formData })
      toast.success({ detail: 'Transação atualizada com sucesso.' })
    } else {
      await createMutation.mutateAsync(formData)
      toast.success({ detail: 'Transação criada com sucesso.' })
    }
    showFormDialog.value = false
  } catch (err: unknown) {
    toast.apiError(err, 'Falha ao salvar transação.')
  }
}

async function handleDeleteConfirm(): Promise<void> {
  if (!deletingTransaction.value) return

  try {
    await deleteMutation.mutateAsync(deletingTransaction.value.id)
    toast.success({ detail: 'Transação excluída com sucesso.' })
    showDeleteDialog.value = false
    deletingTransaction.value = null
  } catch (err: unknown) {
    toast.apiError(err, 'Falha ao excluir transação.')
  }
}

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

const { formatCurrencyBRL: formatCurrency } = useFormatters()

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

async function exportData(format: 'csv' | 'pdf'): Promise<void> {
  if (isExporting.value || pending.value) return
  isExporting.value = true

  try {
    const { downloadExport } = await import('@/utils/reportsExport.client')
    await downloadExport(queryParams.value, format)
    toast.success({ detail: `Exportação ${format === 'csv' ? 'CSV' : 'PDF'} concluída.` })
  } catch (err: unknown) {
    toast.apiError(err, 'Falha ao exportar dados.')
  } finally {
    isExporting.value = false
  }
}

async function handleExportCsv(): Promise<void> {
  await exportData('csv')
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
      <template v-if="pending">
        <div
          v-for="n in 4"
          :key="n"
          class="card-base animate-pulse"
        >
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div class="h-8 bg-gray-200 rounded w-1/2 mt-1" />
        </div>
      </template>

      <template v-else>
        <div class="card-base">
          <p class="text-sm text-gray-500">Transações filtradas</p>
          <p class="text-2xl font-semibold mt-1">{{ summary.totalTransactions }}</p>
        </div>

        <div class="card-base">
          <p class="text-sm text-gray-500">Valor total filtrado</p>
          <p class="text-2xl font-semibold mt-1">{{ formatCurrency(summary.totalAmount) }}</p>
        </div>

        <div class="card-base">
          <p class="text-sm text-gray-500">Ticket médio</p>
          <p class="text-2xl font-semibold mt-1">{{ formatCurrency(summary.averageTicket) }}</p>
        </div>

        <div class="card-base">
          <p class="text-sm text-gray-500">Exportação</p>
          <div
            v-if="canExportReports"
            class="mt-3 flex gap-2"
          >
            <Button
              label="CSV"
              icon="pi pi-file"
              class="p-button-sm p-button-outlined"
              :disabled="pending || isExporting || total === 0"
              @click="handleExportCsv"
            />
            <Button
              label="PDF"
              icon="pi pi-file-pdf"
              class="p-button-sm p-button-outlined"
              :disabled="pending || isExporting || total === 0"
              @click="handleExportPdf"
            />
          </div>
          <p
            v-else
            class="text-xs text-gray-400 mt-3"
          >
            Apenas editores e administradores podem exportar.
          </p>
        </div>
      </template>
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
            :loading="isFetching"
            @select-category="handleCategoryDrilldown"
          />
        </ClientOnly>
      </template>
    </Card>

    <Card>
      <template #title>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Transações detalhadas</h2>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">
              {{ hasActiveAdvancedFilters ? 'Filtros avançados ativos' : 'Visão geral' }}
            </span>
            <Button
              v-if="canCreateTransaction"
              label="Nova Transação"
              icon="pi pi-plus"
              class="p-button-sm"
              @click="handleCreateTransaction"
            />
          </div>
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

        <ClientOnly>
          <TransactionsTable
            :items="transactions"
            :loading="isFetching"
            :total="total"
            :page="page"
            :page-size="pageSize"
            :sort-field="sortField"
            :sort-order="sortOrder"
            :can-edit="canUpdateTransaction"
            :can-delete="canDeleteTransaction"
            @update:page="(value) => (page = value)"
            @update:page-size="(value) => (pageSize = value)"
            @update:sort-field="(value) => (sortField = value)"
            @update:sort-order="(value) => (sortOrder = value)"
            @edit="handleEditTransaction"
            @delete="handleDeleteTransaction"
          />
        </ClientOnly>
      </template>
    </Card>

    <ClientOnly>
      <TransactionFormDialog
        :visible="showFormDialog"
        :transaction="editingTransaction"
        :filter-options="filterOptions"
        :loading="isMutating"
        @update:visible="(v) => (showFormDialog = v)"
        @save="handleFormSave"
      />

      <TransactionDeleteDialog
        :visible="showDeleteDialog"
        :transaction="deletingTransaction"
        :loading="deleteMutation.isPending.value"
        @update:visible="(v) => (showDeleteDialog = v)"
        @confirm="handleDeleteConfirm"
      />
    </ClientOnly>
  </section>
</template>
