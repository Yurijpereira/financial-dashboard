import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

config()

export default defineConfig({
  earlyAccess: true,
  schema: path.join(import.meta.dirname, 'prisma/schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      const { Pool } = await import('pg')
      const pool = new Pool({ connectionString: process.env.DATABASE_URL })
      return new PrismaPg(pool)
    },
  },
} as any)
