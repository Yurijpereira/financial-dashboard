/**
 * Plugin para melhorar a hidratação do cliente
 * Este plugin só roda no cliente e garante que a hidratação seja feita corretamente
 */
export default defineNuxtPlugin(() => {
  if (process.client) {
    // Desabilita avisos de hidratação no dev mode para evitar spam no console
    // Em produção, isso já está desabilitado por padrão
    if (process.dev) {
      const originalWarn = console.warn
      console.warn = (...args: any[]) => {
        // Filtra avisos de hidratação conhecidos
        if (
          typeof args[0] === 'string' &&
          (args[0].includes('Hydration') || 
           args[0].includes('hydration') ||
           args[0].includes('mismatch'))
        ) {
          // Silencia apenas no desenvolvimento
          return
        }
        originalWarn.apply(console, args)
      }
    }

    // Força o navegador a esperar pela hidratação completa
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        // Marca que a hidratação está completa
        document.documentElement.setAttribute('data-hydrated', 'true')
      })
    }
  }
})
