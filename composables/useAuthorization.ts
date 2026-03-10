import type { AppRole } from '@/server/utils/rbac'

const ROLE_LEVEL: Record<AppRole, number> = {
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
}

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
    return ROLE_LEVEL[userRole.value] >= ROLE_LEVEL[requiredRole]
  }

  const isAdmin = computed(() => hasMinRole('ADMIN'))
  const isEditorOrAbove = computed(() => hasMinRole('EDITOR'))

  const canManageTenant = isAdmin
  const canExportReports = isEditorOrAbove

  return {
    userRole,
    roleLabel,
    isAdmin,
    isEditorOrAbove,
    hasMinRole,
    canManageTenant,
    canExportReports,
  }
}
