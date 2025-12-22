<script setup lang="ts">
import { computed } from 'vue'

type VariationStatus = 'positive' | 'negative' | 'neutral' | 'hidden'

const props = defineProps<{
  label: string
  valueFormatted: string
  variationPercentage?: number | null
}>()

const variationStatus = computed<VariationStatus>(() => {
  const variationValue = props.variationPercentage

  if (variationValue === undefined || variationValue === null) {
    return 'hidden'
  }

  if (variationValue > 0) {
    return 'positive'
  }

  if (variationValue < 0) {
    return 'negative'
  }

  return 'neutral'
})

const formattedVariationText = computed(() => {
  const variationValue = props.variationPercentage

  if (variationValue === undefined || variationValue === null) {
    return ''
  }

  const roundedToOneDecimal = Number(variationValue.toFixed(1))

  if (roundedToOneDecimal > 0) {
    return `+${roundedToOneDecimal}%`
  }

  return `${roundedToOneDecimal}%`
})

const variationClassName = computed(() => {
  if (variationStatus.value === 'positive') {
    return 'bg-green-100 text-green-700'
  }

  if (variationStatus.value === 'negative') {
    return 'bg-red-100 text-red-700'
  }

  return 'bg-gray-100 text-gray-700'
})

const variationIconClassName = computed(() => {
  if (variationStatus.value === 'positive') {
    return 'pi pi-arrow-up-right'
  }

  if (variationStatus.value === 'negative') {
    return 'pi pi-arrow-down-right'
  }

  return ''
})
</script>

<template>
  <div class="card-base flex flex-col gap-2">
    <span class="text-sm text-gray-500">
      {{ label }}
    </span>

    <div class="flex items-center justify-between gap-3">
      <strong class="text-2xl font-semibold">
        {{ valueFormatted }}
      </strong>

      <span
        v-if="variationStatus !== 'hidden'"
        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full whitespace-nowrap"
        :class="variationClassName"
        aria-label="Variação percentual"
      >
        <i
          v-if="variationStatus !== 'neutral'"
          :class="variationIconClassName"
        />
        {{ formattedVariationText }}
      </span>
    </div>
  </div>
</template>
