export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    if (import.meta.dev) {
      const originalWarn = console.warn
      console.warn = (...args: any[]) => {
        if (
          typeof args[0] === 'string' &&
          (args[0].includes('Hydration') || 
           args[0].includes('hydration') ||
           args[0].includes('mismatch'))
        ) {
          return
        }
        originalWarn.apply(console, args)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        document.documentElement.setAttribute('data-hydrated', 'true')
      })
    }
  }
})
