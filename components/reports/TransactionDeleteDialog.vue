<script setup lang="ts">
import type { ReportTransaction } from '@/types/reports'
import { REPORT_STATUS_LABELS } from '@/types/reports'
import { useFormatters } from '@/composables/useFormatters'

interface Props {
  visible: boolean
  transaction?: ReportTransaction | null
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  transaction: null,
  loading: false,
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
}>()

const { formatCurrencyBRL: formatCurrency } = useFormatters()

function handleCancel(): void {
  emit('update:visible', false)
}

function handleConfirm(): void {
  emit('confirm')
}
</script>

<template>
  <Dialog
    :visible="visible"
    header="Excluir Transação"
    :modal="true"
    :closable="!loading"
    :style="{ width: '440px' }"
    :draggable="false"
    @update:visible="handleCancel"
  >
    <div class="flex flex-col gap-3">
      <p class="text-gray-700">Tem certeza que deseja excluir esta transação?</p>

      <div
        v-if="transaction"
        class="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm"
      >
        <p>
          <span class="font-medium">Cliente:</span>
          {{ transaction.customerName }}
        </p>
        <p>
          <span class="font-medium">Valor:</span>
          {{ formatCurrency(transaction.amount) }}
        </p>
        <p>
          <span class="font-medium">Status:</span>
          {{ REPORT_STATUS_LABELS[transaction.status] }}
        </p>
      </div>

      <Message
        severity="warn"
        :closable="false"
      >
        Esta ação não pode ser desfeita.
      </Message>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          class="p-button-text"
          :disabled="loading"
          @click="handleCancel"
        />
        <Button
          label="Excluir"
          icon="pi pi-trash"
          class="p-button-danger"
          :disabled="loading"
          :loading="loading"
          @click="handleConfirm"
        />
      </div>
    </template>
  </Dialog>
</template>
