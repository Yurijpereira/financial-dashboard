<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  ReportPaymentMethod,
  ReportTransaction,
  ReportTransactionStatus,
  TransactionFormData,
} from '@/types/reports'
import {
  REPORT_PAYMENT_METHOD_LABELS,
  REPORT_PAYMENT_METHODS,
  REPORT_STATUS_LABELS,
  REPORT_TRANSACTION_STATUSES,
} from '@/types/reports'

type SelectOption = {
  value: string
  label: string
}

type FilterOptions = {
  customers: SelectOption[]
  products: SelectOption[]
}

interface Props {
  visible: boolean
  transaction?: ReportTransaction | null
  filterOptions: FilterOptions
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  transaction: null,
  loading: false,
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  save: [data: TransactionFormData]
}>()

const isEditMode = computed(() => props.transaction !== null)
const dialogTitle = computed(() => (isEditMode.value ? 'Editar Transação' : 'Nova Transação'))

const customerId = ref('')
const productId = ref('')
const date = ref('')
const amount = ref<number | null>(null)
const status = ref<ReportTransactionStatus>('pending')
const paymentMethod = ref<ReportPaymentMethod>('pix')
const description = ref('')

const statusOptions: SelectOption[] = REPORT_TRANSACTION_STATUSES.map((s) => ({
  value: s,
  label: REPORT_STATUS_LABELS[s],
}))

const paymentMethodOptions: SelectOption[] = REPORT_PAYMENT_METHODS.map((m) => ({
  value: m,
  label: REPORT_PAYMENT_METHOD_LABELS[m],
}))

function resetForm(): void {
  customerId.value = ''
  productId.value = ''
  date.value = ''
  amount.value = null
  status.value = 'pending'
  paymentMethod.value = 'pix'
  description.value = ''
}

function populateFromTransaction(tx: ReportTransaction): void {
  customerId.value = tx.customerId
  productId.value = ''
  date.value = tx.date.slice(0, 10)
  amount.value = tx.amount
  status.value = tx.status
  paymentMethod.value = tx.paymentMethod
  description.value = tx.description

  const matchingProduct = props.filterOptions.products.find((p) => p.label === tx.product)
  if (matchingProduct) {
    productId.value = matchingProduct.value
  }
}

watch(
  () => props.visible,
  (isVisible) => {
    if (!isVisible) return

    if (props.transaction) {
      populateFromTransaction(props.transaction)
    } else {
      resetForm()
    }
  },
)

const amountText = computed({
  get: () => (amount.value !== null ? String(amount.value) : ''),
  set: (value: string) => {
    const parsed = Number(value)
    amount.value = value === '' || Number.isNaN(parsed) ? null : parsed
  },
})

const validationErrors = computed(() => {
  const errors: Record<string, string> = {}

  if (!customerId.value) errors.customerId = 'Selecione um cliente'
  if (!productId.value) errors.productId = 'Selecione um produto'
  if (!date.value) errors.date = 'Informe a data'
  if (amount.value === null || amount.value <= 0) errors.amount = 'Informe um valor positivo'
  if (!description.value.trim()) errors.description = 'Informe a descrição'

  return errors
})

const isValid = computed(() => Object.keys(validationErrors.value).length === 0)

function handleSave(): void {
  if (!isValid.value || amount.value === null) return

  const data: TransactionFormData = {
    customerId: customerId.value,
    productId: productId.value,
    date: date.value,
    amount: amount.value,
    status: status.value,
    paymentMethod: paymentMethod.value,
    description: description.value.trim(),
  }

  emit('save', data)
}

function handleClose(): void {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="dialogTitle"
    :modal="true"
    :closable="!loading"
    :style="{ width: '560px' }"
    :draggable="false"
    @update:visible="handleClose"
  >
    <div class="flex flex-col gap-4 pt-2">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Cliente</label>
        <Dropdown
          v-model="customerId"
          :options="filterOptions.customers"
          option-label="label"
          option-value="value"
          placeholder="Selecione o cliente"
          :disabled="loading"
          filter
          class="w-full"
        />
        <small
          v-if="validationErrors.customerId"
          class="text-red-500"
        >
          {{ validationErrors.customerId }}
        </small>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Produto</label>
        <Dropdown
          v-model="productId"
          :options="filterOptions.products"
          option-label="label"
          option-value="value"
          placeholder="Selecione o produto"
          :disabled="loading"
          filter
          class="w-full"
        />
        <small
          v-if="validationErrors.productId"
          class="text-red-500"
        >
          {{ validationErrors.productId }}
        </small>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Data</label>
          <InputText
            v-model="date"
            type="date"
            :disabled="loading"
            class="w-full"
          />
          <small
            v-if="validationErrors.date"
            class="text-red-500"
          >
            {{ validationErrors.date }}
          </small>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Valor (R$)</label>
          <InputText
            v-model="amountText"
            inputmode="decimal"
            placeholder="0.00"
            :disabled="loading"
            class="w-full"
          />
          <small
            v-if="validationErrors.amount"
            class="text-red-500"
          >
            {{ validationErrors.amount }}
          </small>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Status</label>
          <Dropdown
            v-model="status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            :disabled="loading"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Pagamento</label>
          <Dropdown
            v-model="paymentMethod"
            :options="paymentMethodOptions"
            option-label="label"
            option-value="value"
            :disabled="loading"
            class="w-full"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Descrição</label>
        <InputText
          v-model="description"
          placeholder="Descrição da transação"
          :disabled="loading"
          class="w-full"
        />
        <small
          v-if="validationErrors.description"
          class="text-red-500"
        >
          {{ validationErrors.description }}
        </small>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          class="p-button-text"
          :disabled="loading"
          @click="handleClose"
        />
        <Button
          :label="isEditMode ? 'Salvar' : 'Criar'"
          :icon="isEditMode ? 'pi pi-check' : 'pi pi-plus'"
          :disabled="!isValid || loading"
          :loading="loading"
          @click="handleSave"
        />
      </div>
    </template>
  </Dialog>
</template>
