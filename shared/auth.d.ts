declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string
    role: string
    tenantId: string
  }

  interface UserSession {
    user: User
  }
}

export {}
