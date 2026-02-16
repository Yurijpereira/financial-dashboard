<script setup lang="ts">
import { ref } from 'vue'
import { useFilters } from '@/composables/useFilters'
import { useFiltersUrlSync } from '@/composables/useFiltersUrlSync'

const { filters } = useFilters()
const { getShareableUrl, copyShareableUrl } = useFiltersUrlSync()

// Estado do diálogo
const showDialog = ref(false)
const shareUrl = ref('')
const copySuccess = ref(false)

/**
 * Abre o diálogo de compartilhamento
 */
function openShareDialog(): void {
  shareUrl.value = getShareableUrl(filters.value)
  copySuccess.value = false
  showDialog.value = true
}

/**
 * Copia URL para clipboard
 */
async function handleCopyUrl(): Promise<void> {
  const success = await copyShareableUrl(filters.value)

  if (success) {
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 3000)
  }
}

/**
 * Seleciona todo o texto da URL
 */
function selectAll(event: Event): void {
  const input = event.target as HTMLInputElement
  input.select()
}
</script>

<template>
  <div>
    <!-- Botão de compartilhar -->
    <Button
      label="Compartilhar"
      icon="pi pi-share-alt"
      class="p-button-outlined p-button-sm"
      @click="openShareDialog"
    />

    <!-- Diálogo de compartilhamento -->
    <Dialog
      v-model:visible="showDialog"
      header="Compartilhar Filtros"
      :modal="true"
      :style="{ width: '550px' }"
      :draggable="false"
    >
      <div class="flex flex-col gap-4">
        <p class="text-sm text-gray-600">
          Compartilhe esta URL para que outras pessoas possam ver o dashboard com os mesmos filtros aplicados.
        </p>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-700">
            URL com filtros
          </label>

          <div class="flex gap-2">
            <InputText
              :model-value="shareUrl"
              readonly
              class="flex-1 font-mono text-sm"
              @focus="selectAll"
            />

            <Button
              :icon="copySuccess ? 'pi pi-check' : 'pi pi-copy'"
              :class="[
                'p-button-sm',
                copySuccess ? 'p-button-success' : 'p-button-secondary',
              ]"
              :label="copySuccess ? 'Copiado!' : 'Copiar'"
              @click="handleCopyUrl"
            />
          </div>
        </div>

        <Message
          v-if="copySuccess"
          severity="success"
          :closable="false"
        >
          URL copiada para a área de transferência!
        </Message>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div class="flex items-start gap-2">
            <i class="pi pi-info-circle text-blue-600 mt-0.5" />
            <div class="text-sm text-blue-800">
              <strong>Dica:</strong> Qualquer pessoa com este link poderá ver o dashboard com:
              <ul class="list-disc list-inside mt-2 space-y-1">
                <li>Período selecionado</li>
                <li>Filtros de clientes, regiões e produtos</li>
                <li>Configuração de comparação</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <Button
            label="Fechar"
            class="p-button-text"
            @click="showDialog = false"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
