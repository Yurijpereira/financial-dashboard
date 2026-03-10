import type { H3Event } from 'h3'
import type { AppRole, AppPermission } from '@/shared/rbac'
import { isValidRole, hasMinRole, hasPermission } from '@/shared/rbac'

export type { AppRole, AppPermission } from '@/shared/rbac'
export { isValidRole, hasMinRole, hasPermission, getPermissions } from '@/shared/rbac'

export function requireRole(event: H3Event, requiredRole: AppRole): void {
  const userRole = event.context.user?.role as string | undefined

  if (!userRole || !isValidRole(userRole) || !hasMinRole(userRole, requiredRole)) {
    throw createError({
      statusCode: 403,
      message: 'Permissão insuficiente para esta ação',
    })
  }
}

export function requirePermission(event: H3Event, permission: AppPermission): void {
  const userRole = event.context.user?.role as string | undefined

  if (!userRole || !isValidRole(userRole) || !hasPermission(userRole, permission)) {
    throw createError({
      statusCode: 403,
      message: 'Permissão insuficiente para esta ação',
    })
  }
}
