<script setup lang="ts">
import { useSavedViews } from '@/composables/useSavedViews'
import { useFilters } from '@/composables/useFilters'
import { formatToDisplayDate } from '@/utils/dateHelpers'
import type { SavedView } from '@/types/filters'

const { sortedViews, hasViews, createView, deleteView, applyView, hasViewWithName } =
  useSavedViews()

const { filters } = useFilters()

const showDialog = ref(false)
const showSaveDialog = ref(false)
const viewName = ref('')
const saveError = ref('')

const deleteConfirmId = ref<string | null>(null)

function openDialog(): void {
  showDialog.value = true
}

function openSaveDialog(): void {
  viewName.value = ''
  saveError.value = ''
  showSaveDialog.value = true
}

function handleSaveView(): void {
  const name = viewName.value.trim()

  if (!name) {
    saveError.value = 'Por favor, insira um nome para a visualização'
    return
  }

  if (hasViewWithName(name)) {
    saveError.value = 'Já existe uma visualização com este nome'
    return
  }

  createView({
    name,
    filters: filters.value,
  })

  showSaveDialog.value = false
  viewName.value = ''
}

function handleApplyView(id: string): void {
  const viewFilters = applyView(id)
  if (viewFilters) {
    Object.assign(filters.value, viewFilters)
    showDialog.value = false
  }
}

function confirmDelete(id: string): void {
  deleteConfirmId.value = id
}

function cancelDelete(): void {
  deleteConfirmId.value = null
}

function handleDeleteView(id: string): void {
  deleteView(id)
  deleteConfirmId.value = null
}

function formatDate(isoDate: string): string {
  if (!import.meta.client) return ''

  const date = new Date(isoDate)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getFiltersSummary(view: SavedView): string {
  const parts: string[] = []

  parts.push(
    `${formatToDisplayDate(view.filters.dateRange.start)} - ${formatToDisplayDate(view.filters.dateRange.end)}`,
  )

  const filterCount =
    view.filters.customers.length + view.filters.regions.length + view.filters.products.length

  if (filterCount > 0) {
    parts.push(`${filterCount} filtro${filterCount > 1 ? 's' : ''}`)
  }

  if (view.filters.compareWithPrevious) {
    parts.push('com comparação')
  }

  return parts.join(' • ')
}
</script>

<template>
  <div class="flex items-center gap-2">
    <Button
      v-if="hasViews"
      :label="`${sortedViews.length} ${sortedViews.length === 1 ? 'visualização' : 'visualizações'}`"
      icon="pi pi-bookmark"
      class="p-button-outlined p-button-sm"
      @click="openDialog"
    />

    <Button
      label="Salvar visualização"
      icon="pi pi-save"
      class="p-button-outlined p-button-sm"
      @click="openSaveDialog"
    />

    <Dialog
      v-model:visible="showDialog"
      header="Visualizações Salvas"
      :modal="true"
      :style="{ width: '600px' }"
      :draggable="false"
    >
      <div
        v-if="hasViews"
        class="flex flex-col gap-3"
      >
        <div
          v-for="view in sortedViews"
          :key="view.id"
          class="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <i class="pi pi-bookmark text-emerald-600" />
              <h4 class="font-semibold text-gray-900">{{ view.name }}</h4>
            </div>

            <p class="text-sm text-gray-600 mb-2">
              {{ getFiltersSummary(view) }}
            </p>

            <p class="text-xs text-gray-400">Atualizado em {{ formatDate(view.updatedAt) }}</p>
          </div>

          <div class="flex flex-col gap-2">
            <Button
              v-if="deleteConfirmId !== view.id"
              label="Aplicar"
              icon="pi pi-check"
              class="p-button-sm p-button-success"
              @click="handleApplyView(view.id)"
            />

            <Button
              v-if="deleteConfirmId === view.id"
              label="Confirmar?"
              icon="pi pi-trash"
              class="p-button-sm p-button-danger"
              @click="handleDeleteView(view.id)"
            />

            <Button
              v-if="deleteConfirmId === view.id"
              label="Cancelar"
              icon="pi pi-times"
              class="p-button-sm p-button-text"
              @click="cancelDelete"
            />

            <Button
              v-if="deleteConfirmId !== view.id"
              icon="pi pi-trash"
              class="p-button-sm p-button-text p-button-danger"
              @click="confirmDelete(view.id)"
            />
          </div>
        </div>
      </div>

      <Message
        v-else
        severity="info"
        :closable="false"
      >
        Nenhuma visualização salva ainda. Salve suas configurações de filtro para acessá-las
        rapidamente depois!
      </Message>
    </Dialog>

    <Dialog
      v-model:visible="showSaveDialog"
      header="Salvar Visualização"
      :modal="true"
      :style="{ width: '450px' }"
      :draggable="false"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label
            for="view-name"
            class="text-sm font-medium text-gray-700"
          >
            Nome da visualização
          </label>
          <InputText
            id="view-name"
            v-model="viewName"
            placeholder="Ex: Vendas Dezembro 2025"
            class="w-full"
            @keyup.enter="handleSaveView"
          />

          <Message
            v-if="saveError"
            severity="error"
            :closable="false"
          >
            {{ saveError }}
          </Message>
        </div>

        <div class="flex justify-end gap-2">
          <Button
            label="Cancelar"
            class="p-button-text"
            @click="showSaveDialog = false"
          />
          <Button
            label="Salvar"
            icon="pi pi-save"
            @click="handleSaveView"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
