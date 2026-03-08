export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, _instance, info) => {
    console.error(`[Vue Error] ${info}:`, error)
  }

  nuxtApp.hook('vue:error', (error, _instance, info) => {
    console.error(`[Nuxt Vue Error] ${info}:`, error)
  })
})
