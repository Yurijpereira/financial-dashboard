import { defineNuxtPlugin } from 'nuxt/app'
import * as echarts from 'echarts'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      echarts,
    },
  }
})
