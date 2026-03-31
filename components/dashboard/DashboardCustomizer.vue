<script setup lang="ts">
import { ref } from 'vue'
import { useDashboardLayout } from '@/composables/useDashboardLayout'
import { DASHBOARD_WIDGETS_META } from '@/types/dashboard'
import type { DashboardWidgetId } from '@/types/dashboard'

const { orderedWidgets, toggleWidget, moveWidget, resetLayout } = useDashboardLayout()

const visible = defineModel<boolean>('visible', { default: false })

const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function getWidgetMeta(id: DashboardWidgetId) {
  return DASHBOARD_WIDGETS_META[id]
}

function onDragStart(index: number) {
  dragIndex.value = index
}

function onDragOver(event: DragEvent, index: number) {
  event.preventDefault()
  dragOverIndex.value = index
}

function onDrop(index: number) {
  if (dragIndex.value !== null && dragIndex.value !== index) {
    moveWidget(dragIndex.value, index)
  }
  dragIndex.value = null
  dragOverIndex.value = null
}

function onDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}

function handleMoveUp(index: number) {
  if (index > 0) moveWidget(index, index - 1)
}

function handleMoveDown(index: number) {
  if (index < orderedWidgets.value.length - 1) moveWidget(index, index + 1)
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    header="Personalizar Dashboard"
    :modal="true"
    :draggable="false"
    :style="{ width: '480px' }"
  >
    <p class="text-sm text-gray-500 mb-4">Escolha quais cards exibir e arraste para reordenar.</p>

    <ul class="flex flex-col gap-1">
      <li
        v-for="(widget, index) in orderedWidgets"
        :key="widget.id"
        draggable="true"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors select-none"
        :class="[
          dragOverIndex === index && dragIndex !== index
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-200 bg-white hover:bg-gray-50',
          dragIndex === index ? 'opacity-40' : '',
        ]"
        @dragstart="onDragStart(index)"
        @dragover="onDragOver($event, index)"
        @drop="onDrop(index)"
        @dragend="onDragEnd"
      >
        <i
          class="pi pi-bars text-gray-400 cursor-grab active:cursor-grabbing"
          aria-hidden="true"
        />

        <i
          :class="getWidgetMeta(widget.id).icon"
          class="text-gray-500"
          aria-hidden="true"
        />

        <span class="flex-1 text-sm font-medium text-gray-700">
          {{ getWidgetMeta(widget.id).label }}
        </span>

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="index === 0"
            :aria-label="`Mover ${getWidgetMeta(widget.id).label} para cima`"
            @click="handleMoveUp(index)"
          >
            <i
              class="pi pi-chevron-up text-xs"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="index === orderedWidgets.length - 1"
            :aria-label="`Mover ${getWidgetMeta(widget.id).label} para baixo`"
            @click="handleMoveDown(index)"
          >
            <i
              class="pi pi-chevron-down text-xs"
              aria-hidden="true"
            />
          </button>
        </div>

        <ToggleSwitch
          :model-value="widget.visible"
          :aria-label="`Exibir ${getWidgetMeta(widget.id).label}`"
          @update:model-value="toggleWidget(widget.id)"
        />
      </li>
    </ul>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <Button
          label="Restaurar padrão"
          icon="pi pi-refresh"
          severity="secondary"
          text
          size="small"
          @click="resetLayout()"
        />
        <Button
          label="Fechar"
          size="small"
          @click="visible = false"
        />
      </div>
    </template>
  </Dialog>
</template>
