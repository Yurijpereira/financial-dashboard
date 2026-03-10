import type { AppRole, AppPermission } from '@/server/utils/rbac'
import { hasMinRole as checkMinRole, hasPermission as checkPermission } from '@/server/utils/rbac'

const ROLE_LABELS: Record<AppRole, string> = {
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  VIEWER: 'Visualizador',
}

export function useAuthorization() {
  const { user } = useUserSession()

  const userRole = computed<AppRole>(() => (user.value?.role as AppRole) ?? 'VIEWER')

  const roleLabel = computed(() => ROLE_LABELS[userRole.value])

  function hasMinRole(requiredRole: AppRole): boolean {
    return checkMinRole(userRole.value, requiredRole)
  }

  function hasPermissionFor(permission: AppPermission): boolean {
    return checkPermission(userRole.value, permission)
  }

  const isAdmin = computed(() => hasMinRole('ADMIN'))
  const isEditorOrAbove = computed(() => hasMinRole('EDITOR'))

  const canManageTenant = computed(() => hasPermissionFor('tenant:manage'))
  const canExportReports = computed(() => hasPermissionFor('reports:export'))
  const canBulkReadReports = computed(() => hasPermissionFor('reports:bulk-read'))
  const canCreateTransaction = computed(() => hasPermissionFor('transactions:create'))
  const canUpdateTransaction = computed(() => hasPermissionFor('transactions:update'))
  const canDeleteTransaction = computed(() => hasPermissionFor('transactions:delete'))

  return {
    userRole,
    roleLabel,
    isAdmin,
    isEditorOrAbove,
    hasMinRole,
    hasPermissionFor,
    canManageTenant,
    canExportReports,
    canBulkReadReports,
    canCreateTransaction,
    canUpdateTransaction,
    canDeleteTransaction,
  }
}
