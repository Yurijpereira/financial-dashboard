export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  const publicRoutes = ['/login']
  const isPublic = publicRoutes.includes(to.path)

  if (!loggedIn.value && !isPublic) {
    return navigateTo('/login')
  }

  if (loggedIn.value && isPublic) {
    return navigateTo('/')
  }
})
