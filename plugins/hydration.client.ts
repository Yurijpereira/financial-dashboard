export default defineNuxtPlugin(() => {
  window.addEventListener('load', () => {
    document.documentElement.setAttribute('data-hydrated', 'true')
  })
})
