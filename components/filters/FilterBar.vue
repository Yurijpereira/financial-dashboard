<script setup lang="ts">
import { ref } from 'vue'
import Card from 'primevue/card'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import QuickPeriodButtons from '@/components/filters/QuickPeriodButtons.vue'
import DateRangePicker from '@/components/filters/DateRangePicker.vue'
import { useFilters } from '@/composables/useFilters'
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

// Estado de expansão das seções
const showAdvancedFilters = ref(false)

// Opções mockadas (em produção viriam da API)
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

// Refs locais para os selects
const selectedCustomers = ref<string[]>([...filters.value.customers])
const selectedRegions = ref<string[]>([...filters.value.regions])
const selectedProducts = ref<string[]>([...filters.value.products])

// Sincroniza mudanças
function handleCustomersChange(value: string[]): void {
  setCustomers(value)
}

function handleRegionsChange(value: string[]): void {
  setRegions(value)
}

function handleProductsChange(value: string[]): void {
  setProducts(value)
}

function toggleAdvancedFilters(): void {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

function handleReset(): void {
  resetFilters()
  selectedCustomers.value = []
  selectedRegions.value = []
  selectedProducts.value = []
}
</script>

<template>
  <Card class="border border-gray-200">
    <template #content>
      <div class="flex flex-col gap-6">
        <!-- Cabeçalho -->
        <div class="flex items-center justify-between">
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

          <div class="flex items-center gap-2">
            <Button
              v-if="hasActiveFilters || filters.preset !== '30days'"
              label="Limpar filtros"
              icon="pi pi-times"
              class="p-button-text p-button-sm text-gray-600"
              @click="handleReset"
            />
          </div>
        </div>

        <!-- Período Rápido -->
        <div class="flex flex-col gap-3">
          <label class="text-sm font-medium text-gray-700">
            Período
          </label>
          <QuickPeriodButtons />
        </div>

        <!-- Date Range Picker -->
        <div class="flex flex-col gap-3">
          <label class="text-sm font-medium text-gray-700">
            Intervalo personalizado
          </label>
          <DateRangePicker />
        </div>

        <!-- Divisor -->
        <div class="border-t border-gray-200" />

        <!-- Botão Filtros Avançados -->
        <Button
          :label="showAdvancedFilters ? 'Ocultar filtros avançados' : 'Mostrar filtros avançados'"
          :icon="showAdvancedFilters ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
          class="p-button-outlined p-button-secondary"
          @click="toggleAdvancedFilters"
        />

        <!-- Filtros Avançados -->
        <transition
          name="fade"
          mode="out-in"
        >
          <div
            v-if="showAdvancedFilters"
            class="flex flex-col gap-4 pt-2"
          >
            <!-- Clientes -->
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
                @update:model-value="handleCustomersChange"
              />
            </div>

            <!-- Regiões -->
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
                @update:model-value="handleRegionsChange"
              />
            </div>

            <!-- Produtos -->
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
                @update:model-value="handleProductsChange"
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
