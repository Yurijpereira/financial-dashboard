<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import QuickPeriodButtons from '@/components/filters/QuickPeriodButtons.vue'
import DateRangePicker from '@/components/filters/DateRangePicker.vue'
import ComparisonToggle from '@/components/filters/ComparisonToggle.vue'
import SavedViewsManager from '@/components/filters/SavedViewsManager.vue'
import ShareFiltersButton from '@/components/filters/ShareFiltersButton.vue'
import { useFilters } from '@/composables/useFilters'
import { useFiltersUrlSync } from '@/composables/useFiltersUrlSync'
import type { FilterOption } from '@/types/filters'

const {
  filters,
  hasActiveFilters,
  activeFiltersCount,
  setCustomers,
  setRegions,
  setProducts,
  resetFilters,
} = useFilters()

const { loadFiltersFromUrl, watchFiltersForUrlSync } = useFiltersUrlSync()

const showAdvancedFilters = ref(false)
const isClient = ref(false)

const customerOptions: FilterOption[] = [
  { value: 'c_1', label: 'Tech Solutions Brasil' },
  { value: 'c_2', label: 'Investimentos LTDA.' },
  { value: 'c_3', label: 'Fintech Empresarial' },
  { value: 'c_4', label: 'Consultoria Digital' },
  { value: 'c_5', label: 'Grupo Inovação' },
  { value: 'c_6', label: 'Sistemas Integrados' },
  { value: 'c_7', label: 'TechCorp Solutions' },
]

const regionOptions: FilterOption[] = [
  { value: 'sudeste', label: 'Sudeste' },
  { value: 'sul', label: 'Sul' },
  { value: 'nordeste', label: 'Nordeste' },
  { value: 'norte', label: 'Norte' },
  { value: 'centro-oeste', label: 'Centro-Oeste' },
]

const productOptions: FilterOption[] = [
  { value: 'software', label: 'Software' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'suporte', label: 'Suporte Técnico' },
  { value: 'treinamento', label: 'Treinamento' },
  { value: 'licencas', label: 'Licenças' },
  { value: 'hardware', label: 'Hardware' },
]

const selectedCustomers = computed({
  get: () => filters.value.customers,
  set: (value: string[]) => setCustomers(value),
})

const selectedRegions = computed({
  get: () => filters.value.regions,
  set: (value: string[]) => setRegions(value),
})

const selectedProducts = computed({
  get: () => filters.value.products,
  set: (value: string[]) => setProducts(value),
})

function toggleAdvancedFilters(): void {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

function handleReset(): void {
  resetFilters()
}

onMounted(() => {
  isClient.value = true
  
  if (import.meta.client) {
    loadFiltersFromUrl()
    
    watchFiltersForUrlSync(() => filters.value, { debounce: 500 })
  }
})
</script>

<template>
  <Card class="border border-gray-200">
    <template #content>
      <div class="flex flex-col gap-6">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <i class="pi pi-filter text-xl text-gray-600" />
            <h2 class="text-lg font-semibold text-gray-900">Filtros</h2>
            <span
              v-if="hasActiveFilters"
              class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-emerald-600 rounded-full"
            >
              {{ activeFiltersCount }}
            </span>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <SavedViewsManager />
            <ShareFiltersButton />
            
            <Button
              v-if="hasActiveFilters || filters.preset !== '30days'"
              label="Limpar filtros"
              icon="pi pi-times"
              class="p-button-text p-button-sm text-gray-600"
              @click="handleReset"
            />
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <label class="text-sm font-medium text-gray-700">
            Período
          </label>
          <QuickPeriodButtons />
        </div>

        <div class="flex flex-col gap-3">
          <label class="text-sm font-medium text-gray-700">
            Intervalo personalizado
          </label>
          <DateRangePicker />
        </div>

        <ComparisonToggle />

        <div class="border-t border-gray-200" />

        <Button
          :label="showAdvancedFilters ? 'Ocultar filtros avançados' : 'Mostrar filtros avançados'"
          :icon="showAdvancedFilters ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
          class="p-button-outlined p-button-secondary"
          @click="toggleAdvancedFilters"
        />

        <transition
          name="fade"
          mode="out-in"
        >
          <div
            v-if="showAdvancedFilters"
            class="flex flex-col gap-4 pt-2"
          >
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-gray-700">
                Clientes
              </label>
              <MultiSelect
                v-model="selectedCustomers"
                :options="customerOptions"
                option-label="label"
                option-value="value"
                placeholder="Selecione os clientes"
                :max-selected-labels="3"
                class="w-full"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-gray-700">
                Regiões
              </label>
              <MultiSelect
                v-model="selectedRegions"
                :options="regionOptions"
                option-label="label"
                option-value="value"
                placeholder="Selecione as regiões"
                :max-selected-labels="3"
                class="w-full"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-gray-700">
                Produtos/Serviços
              </label>
              <MultiSelect
                v-model="selectedProducts"
                :options="productOptions"
                option-label="label"
                option-value="value"
                placeholder="Selecione os produtos"
                :max-selected-labels="3"
                class="w-full"
              />
            </div>
          </div>
        </transition>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
