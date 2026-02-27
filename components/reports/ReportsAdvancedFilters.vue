<script setup lang="ts">
import { computed } from 'vue'
import type {
  ReportPaymentMethod,
  ReportsAdvancedFilters,
  ReportTransactionCategory,
  ReportTransactionStatus,
} from '@/types/reports'
import {
  REPORT_CATEGORY_LABELS,
  REPORT_PAYMENT_METHOD_LABELS,
  REPORT_PAYMENT_METHODS,
  REPORT_STATUS_LABELS,
  REPORT_TRANSACTION_CATEGORIES,
  REPORT_TRANSACTION_STATUSES,
} from '@/types/reports'

type SelectOption = {
  value: string
  label: string
}

interface Props {
  filters: ReportsAdvancedFilters
  search: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  'update:filters': [value: ReportsAdvancedFilters]
  'update:search': [value: string]
  reset: []
}>()

const statusOptions: SelectOption[] = REPORT_TRANSACTION_STATUSES.map((status) => ({
  value: status,
  label: REPORT_STATUS_LABELS[status],
}))

const categoryOptions: SelectOption[] = REPORT_TRANSACTION_CATEGORIES.map((category) => ({
  value: category,
  label: REPORT_CATEGORY_LABELS[category],
}))

const paymentMethodOptions: SelectOption[] = REPORT_PAYMENT_METHODS.map((method) => ({
  value: method,
  label: REPORT_PAYMENT_METHOD_LABELS[method],
}))

const selectedStatuses = computed({
  get: () => props.filters.statuses,
  set: (value: ReportTransactionStatus[]) => {
    updateFilters({ statuses: value })
  },
})

const selectedCategories = computed({
  get: () => props.filters.categories,
  set: (value: ReportTransactionCategory[]) => {
    updateFilters({ categories: value })
  },
})

const selectedPaymentMethods = computed({
  get: () => props.filters.paymentMethods,
  set: (value: ReportPaymentMethod[]) => {
    updateFilters({ paymentMethods: value })
  },
})

const minAmountText = computed({
  get: () => (props.filters.minAmount !== null ? String(props.filters.minAmount) : ''),
  set: (value: string) => {
    const parsed = Number(value)
    updateFilters({
      minAmount: value === '' || Number.isNaN(parsed) ? null : parsed,
    })
  },
})

const maxAmountText = computed({
  get: () => (props.filters.maxAmount !== null ? String(props.filters.maxAmount) : ''),
  set: (value: string) => {
    const parsed = Number(value)
    updateFilters({
      maxAmount: value === '' || Number.isNaN(parsed) ? null : parsed,
    })
  },
})

const searchText = computed({
  get: () => props.search,
  set: (value: string) => {
    emit('update:search', value)
  },
})

function updateFilters(patch: Partial<ReportsAdvancedFilters>): void {
  emit('update:filters', {
    ...props.filters,
    ...patch,
  })
}

function handleReset(): void {
  emit('reset')
}
</script>

<template>
  <Card class="border border-gray-200">
    <template #content>
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <h2 class="text-base font-semibold text-gray-900">
            Filtros detalhados
          </h2>
          <Button
            label="Limpar filtros"
            icon="pi pi-filter-slash"
            class="p-button-text p-button-sm"
            :disabled="loading"
            @click="handleReset"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div class="flex flex-col gap-2 xl:col-span-3">
            <label class="text-sm font-medium text-gray-700">
              Busca
            </label>
            <InputText
              v-model="searchText"
              placeholder="Buscar por ID, cliente, produto ou descricao"
              :disabled="loading"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">
              Status
            </label>
            <MultiSelect
              v-model="selectedStatuses"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Todos os status"
              :max-selected-labels="2"
              :disabled="loading"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">
              Categoria
            </label>
            <MultiSelect
              v-model="selectedCategories"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              placeholder="Todas as categorias"
              :max-selected-labels="2"
              :disabled="loading"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">
              Pagamento
            </label>
            <MultiSelect
              v-model="selectedPaymentMethods"
              :options="paymentMethodOptions"
              option-label="label"
              option-value="value"
              placeholder="Todos os metodos"
              :max-selected-labels="2"
              :disabled="loading"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">
              Valor minimo (R$)
            </label>
            <InputText
              v-model="minAmountText"
              inputmode="decimal"
              placeholder="0"
              :disabled="loading"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">
              Valor maximo (R$)
            </label>
            <InputText
              v-model="maxAmountText"
              inputmode="decimal"
              placeholder="10000"
              :disabled="loading"
            />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
