export type AppRole = 'ADMIN' | 'EDITOR' | 'VIEWER'

export type AppPermission =
  | 'tenant:manage'
  | 'reports:export'
  | 'reports:bulk-read'
  | 'transactions:create'
  | 'transactions:update'
  | 'transactions:delete'
  | 'settings:read'
  | 'settings:write'
  | 'dashboard:read'

const ROLE_LEVEL: Record<AppRole, number> = {
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
}

const ROLE_PERMISSIONS: Record<AppRole, ReadonlySet<AppPermission>> = {
  VIEWER: new Set<AppPermission>(['dashboard:read', 'settings:read']),
  EDITOR: new Set<AppPermission>([
    'dashboard:read',
    'settings:read',
    'settings:write',
    'reports:export',
    'reports:bulk-read',
    'transactions:create',
    'transactions:update',
  ]),
  ADMIN: new Set<AppPermission>([
    'dashboard:read',
    'settings:read',
    'settings:write',
    'reports:export',
    'reports:bulk-read',
    'transactions:create',
    'transactions:update',
    'transactions:delete',
    'tenant:manage',
  ]),
}

export function isValidRole(role: string): role is AppRole {
  return Object.hasOwn(ROLE_LEVEL, role)
}

export function hasMinRole(userRole: AppRole, requiredRole: AppRole): boolean {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole]
}

export function hasPermission(role: AppRole, permission: AppPermission): boolean {
  return ROLE_PERMISSIONS[role].has(permission)
}

export function getPermissions(role: AppRole): ReadonlySet<AppPermission> {
  return ROLE_PERMISSIONS[role]
}
