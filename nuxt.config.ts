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
    '~/assets/scss/main.scss',
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

  optimization: {
    treeShake: {
      composables: {
        client: {
          useFilters: ['loadFiltersFromStorage', 'saveFiltersToStorage', 'setupFiltersStorageWatcher'],
          useSavedViews: ['loadViewsFromStorage', 'saveViewsToStorage'],
        }
      }
    }
  },

  modules: ['@pinia/nuxt'],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  ssr: true,

  experimental: {
    payloadExtraction: false,
  },

  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  features: {
    inlineStyles: false,
  },
})
