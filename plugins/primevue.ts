import { defineNuxtPlugin } from '#app'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'

// Import PrimeVue components
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import Checkbox from 'primevue/checkbox'

const CustomPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}',
    },
  },
})

export default defineNuxtPlugin((nuxtApp) => {
  // Configure PrimeVue with theme
  nuxtApp.vueApp.use(PrimeVue, {
    ripple: true,
    theme: {
      preset: CustomPreset,
      options: {
        darkModeSelector: false,
        cssLayer: {
          name: 'primevue',
          order: 'tailwind-base, primevue, tailwind-utilities',
        },
      },
    },
  })

  // Register components globally
  nuxtApp.vueApp.component('Button', Button)
  nuxtApp.vueApp.component('Card', Card)
  nuxtApp.vueApp.component('Dropdown', Dropdown)
  nuxtApp.vueApp.component('DataTable', DataTable)
  nuxtApp.vueApp.component('Column', Column)
  nuxtApp.vueApp.component('DatePicker', DatePicker)
  nuxtApp.vueApp.component('InputText', InputText)
  nuxtApp.vueApp.component('MultiSelect', MultiSelect)
  nuxtApp.vueApp.component('Dialog', Dialog)
  nuxtApp.vueApp.component('Message', Message)
  nuxtApp.vueApp.component('Checkbox', Checkbox)
})
