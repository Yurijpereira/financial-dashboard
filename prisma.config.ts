import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

config()

export default defineConfig({
  schema: path.join(import.meta.dirname, 'prisma/schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
  // earlyAccess and migrate.adapter are not yet in the public PrismaConfig types
  // (they are read by the CLI at runtime but omitted from the type declarations).
  // Scoping the cast to only the untyped fields preserves type-safety for the rest.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  ...({
    earlyAccess: true,
    migrate: {
      async adapter() {
        const { PrismaPg } = await import('@prisma/adapter-pg')
        const { Pool } = await import('pg')
        const pool = new Pool({ connectionString: process.env.DATABASE_URL })
        return new PrismaPg(pool)
      },
    },
  } as any),
  /* eslint-enable @typescript-eslint/no-explicit-any */
})
