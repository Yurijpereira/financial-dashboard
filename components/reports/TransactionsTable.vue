<script setup lang="ts">
import { computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'
import type { DataTablePageEvent, DataTableSortEvent } from 'primevue/datatable'
import type {
  ReportSortField,
  ReportSortOrder,
  ReportTransaction,
  ReportTransactionStatus,
} from '@/types/reports'
import { REPORT_STATUS_LABELS } from '@/types/reports'

interface Props {
  items: ReportTransaction[]
  total: number
  page: number
  pageSize: number
  sortField: ReportSortField
  sortOrder: ReportSortOrder
  loading?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  canEdit: false,
  canDelete: false,
})

const emit = defineEmits<{
  'update:page': [value: number]
  'update:pageSize': [value: number]
  'update:sortField': [value: ReportSortField]
  'update:sortOrder': [value: ReportSortOrder]
  edit: [transaction: ReportTransaction]
  delete: [transaction: ReportTransaction]
}>()

const primeSortOrder = computed(() => {
  return props.sortOrder === 'asc' ? 1 : -1
})

const { formatCurrencyBRL: formatCurrency } = useFormatters()

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getStatusClass(status: ReportTransactionStatus): string {
  if (status === 'paid') return 'bg-emerald-100 text-emerald-700'
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  if (status === 'failed') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

function isSortField(value: DataTableSortEvent['sortField']): value is ReportSortField {
  return (
    typeof value === 'string' &&
    (value === 'date' || value === 'amount' || value === 'customerName' || value === 'status')
  )
}

function handlePage(event: DataTablePageEvent): void {
  emit('update:page', event.page + 1)

  if (event.rows !== props.pageSize) {
    emit('update:pageSize', event.rows)
  }
}

function handleSort(event: DataTableSortEvent): void {
  const nextSortField = isSortField(event.sortField) ? event.sortField : 'date'
  const nextSortOrder: ReportSortOrder = event.sortOrder === 1 ? 'asc' : 'desc'

  emit('update:sortField', nextSortField)
  emit('update:sortOrder', nextSortOrder)
  emit('update:page', 1)
}
</script>

<template>
  <DataTable
    :value="items"
    :loading="loading"
    lazy
    paginator
    striped-rows
    responsive-layout="scroll"
    :rows="pageSize"
    :first="(page - 1) * pageSize"
    :total-records="total"
    :rows-per-page-options="[10, 15, 25, 50]"
    paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
    current-page-report-template="{first} a {last} de {totalRecords}"
    :sort-field="sortField"
    :sort-order="primeSortOrder"
    @page="handlePage"
    @sort="handleSort"
  >
    <Column
      field="date"
      header="Data"
      sortable
      style="min-width: 11rem"
    >
      <template #body="{ data }: { data: ReportTransaction }">
        {{ formatDate(data.date) }}
      </template>
    </Column>

    <Column
      field="id"
      header="ID"
      style="min-width: 10rem"
    />

    <Column
      field="customerName"
      header="Cliente"
      sortable
      style="min-width: 13rem"
    />

    <Column
      field="description"
      header="Descrição"
      style="min-width: 16rem"
    />

    <Column
      field="status"
      header="Status"
      sortable
      style="min-width: 9rem"
    >
      <template #body="{ data }: { data: ReportTransaction }">
        <span
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
          :class="getStatusClass(data.status)"
        >
          {{ REPORT_STATUS_LABELS[data.status] }}
        </span>
      </template>
    </Column>

    <Column
      field="amount"
      header="Valor"
      sortable
      style="min-width: 9rem"
    >
      <template #body="{ data }: { data: ReportTransaction }">
        <div class="font-medium">
          {{ formatCurrency(data.amount) }}
        </div>
      </template>
    </Column>

    <Column
      v-if="canEdit || canDelete"
      header="Ações"
      style="min-width: 7rem"
    >
      <template #body="{ data }: { data: ReportTransaction }">
        <div class="flex gap-1">
          <Button
            v-if="canEdit"
            icon="pi pi-pencil"
            class="p-button-text p-button-sm p-button-rounded"
            @click="emit('edit', data)"
          />
          <Button
            v-if="canDelete"
            icon="pi pi-trash"
            class="p-button-text p-button-sm p-button-rounded p-button-danger"
            @click="emit('delete', data)"
          />
        </div>
      </template>
    </Column>

    <template #empty>
      <DataEmptyState
        icon="pi pi-inbox"
        message="Nenhuma transação encontrada para os filtros atuais."
      />
    </template>
  </DataTable>
</template>
