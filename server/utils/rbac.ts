import type { H3Event } from 'h3'

export type AppRole = 'ADMIN' | 'EDITOR' | 'VIEWER'

const ROLE_LEVEL: Record<AppRole, number> = {
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
}

export function isValidRole(role: string): role is AppRole {
  return role in ROLE_LEVEL
}

export function hasMinRole(userRole: AppRole, requiredRole: AppRole): boolean {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole]
}

export function requireRole(event: H3Event, requiredRole: AppRole): void {
  const userRole = event.context.user?.role as string | undefined

  if (!userRole || !isValidRole(userRole) || !hasMinRole(userRole, requiredRole)) {
    throw createError({
      statusCode: 403,
      message: 'Permissão insuficiente para esta ação',
    })
  }
}
