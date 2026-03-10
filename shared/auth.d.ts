import type { AppRole } from '@/server/utils/rbac'

declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string
    role: AppRole
    tenantId: string
  }

  interface UserSession {
    user: User
  }
}

export {}
