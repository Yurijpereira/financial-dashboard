export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // Skip auth routes
  if (path.startsWith('/api/auth/')) {
    return
  }

  // Protect all other API routes
  if (path.startsWith('/api/')) {
    const session = await getUserSession(event)

    if (!session?.user) {
      throw createError({
        statusCode: 401,
        message: 'Não autenticado',
      })
    }

    // Attach tenant context to event
    event.context.user = session.user
    event.context.tenantId = session.user.tenantId
  }
})
