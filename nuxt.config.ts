export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  css: [
    'primeicons/primeicons.css',
    '@@/assets/scss/main.scss',
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '',
        },
      },
    },
    optimizeDeps: {
      include: ['echarts'],
    },
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  build: {
    transpile: ['primevue', 'echarts'],
  },

  modules: ['@pinia/nuxt'],

  typescript: {
    strict: true,
    typeCheck: false,
  },
})
