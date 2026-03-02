export default defineNuxtPlugin(() => {
  // Sets data-hydrated on <html> after load so CSS or e2e tests can
  // assert that client-side hydration completed successfully.
  // NOTE: never suppress hydration warnings — they indicate real
  // server/client HTML mismatches that must be fixed at the source.
  window.addEventListener('load', () => {
    document.documentElement.setAttribute('data-hydrated', 'true')
  })
})
