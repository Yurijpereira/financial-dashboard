<script setup lang="ts">
const props = defineProps<{
  label: string
  valueFormatted: string
  variationPercentage?: number | null
}>()

const isVariationPositive = computed(() => {
  if (props.variationPercentage === undefined || props.variationPercentage === null) {
    return null
  }

  return props.variationPercentage >= 0
})
</script>

<template>
  <div class="card-base flex flex-col gap-2">
    <span class="text-sm text-gray-500">
      {{ label }}
    </span>

    <div class="flex items-center justify-between">
      <strong class="text-2xl font-semibold">
        {{ valueFormatted }}
      </strong>

      <span
        v-if="variationPercentage !== undefined && variationPercentage !== null"
        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
        :class="{
          'bg-green-100 text-green-700': isVariationPositive === true,
          'bg-red-100 text-red-700': isVariationPositive === false,
        }"
      >
        <i
          v-if="isVariationPositive !== null"
          class="pi"
          :class="isVariationPositive ? 'pi-arrow-up-right' : 'pi-arrow-down-right'"
        />
        {{ variationPercentage }}%
      </span>
    </div>
  </div>
</template>
