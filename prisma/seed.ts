import {
  PrismaClient,
  ProductCategory,
  TransactionStatus,
  PaymentMethod,
  UserRole,
} from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { config } from 'dotenv'
import { Hash } from '@adonisjs/hash'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'

config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ─── Password hashing (uses @adonisjs/hash, same as nuxt-auth-utils) ───

const hash = new Hash(new Scrypt({}))

async function hashPassword(password: string): Promise<string> {
  return hash.make(password)
}

// ─── Seeded random (deterministic, same as old reportsDataset.ts) ───

function createSeededRandom(seed: number): () => number {
  let state = seed % 2147483647
  if (state <= 0) state += 2147483646
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

function pickWeighted<T>(random: () => number, values: Array<{ value: T; weight: number }>): T {
  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0)
  const threshold = random() * totalWeight
  let cumulative = 0
  for (const item of values) {
    cumulative += item.weight
    if (threshold <= cumulative) return item.value
  }
  return values[values.length - 1]!.value
}

function pickRandom<T>(random: () => number, values: T[]): T {
  return values[Math.floor(random() * values.length)]!
}

function randomDate(random: () => number, min: Date, max: Date): Date {
  const ts = Math.floor(min.getTime() + random() * (max.getTime() - min.getTime()))
  return new Date(ts)
}

// ─── Catalogs ──────────────────────────────────────────────────────

type CustomerDef = { name: string; region: string }
type ProductDef = { name: string; category: ProductCategory }

const CUSTOMERS: CustomerDef[] = [
  { name: 'Tech Solutions Brasil', region: 'sudeste' },
  { name: 'Investimentos LTDA.', region: 'sudeste' },
  { name: 'Fintech Empresarial', region: 'sul' },
  { name: 'Consultoria Digital', region: 'nordeste' },
  { name: 'Grupo Inovação', region: 'norte' },
  { name: 'Sistemas Integrados', region: 'centro-oeste' },
  { name: 'TechCorp Solutions', region: 'sul' },
]

const PRODUCTS: ProductDef[] = [
  { name: 'Software', category: ProductCategory.SUBSCRIPTION },
  { name: 'Licenças', category: ProductCategory.SUBSCRIPTION },
  { name: 'Consultoria', category: ProductCategory.SERVICE },
  { name: 'Integração', category: ProductCategory.SERVICE },
  { name: 'Hardware', category: ProductCategory.HARDWARE },
  { name: 'Periféricos', category: ProductCategory.HARDWARE },
  { name: 'Suporte Técnico', category: ProductCategory.SUPPORT },
  { name: 'Monitoramento', category: ProductCategory.SUPPORT },
  { name: 'Treinamento', category: ProductCategory.TRAINING },
  { name: 'Workshop', category: ProductCategory.TRAINING },
]

const STATUS_WEIGHTS: Array<{ value: TransactionStatus; weight: number }> = [
  { value: TransactionStatus.PAID, weight: 72 },
  { value: TransactionStatus.PENDING, weight: 16 },
  { value: TransactionStatus.FAILED, weight: 7 },
  { value: TransactionStatus.REFUNDED, weight: 5 },
]

const CATEGORY_WEIGHTS: Array<{ value: ProductCategory; weight: number }> = [
  { value: ProductCategory.SUBSCRIPTION, weight: 26 },
  { value: ProductCategory.SERVICE, weight: 24 },
  { value: ProductCategory.HARDWARE, weight: 18 },
  { value: ProductCategory.SUPPORT, weight: 20 },
  { value: ProductCategory.TRAINING, weight: 12 },
]

const PAYMENT_WEIGHTS: Array<{ value: PaymentMethod; weight: number }> = [
  { value: PaymentMethod.CREDIT_CARD, weight: 40 },
  { value: PaymentMethod.PIX, weight: 34 },
  { value: PaymentMethod.BANK_SLIP, weight: 14 },
  { value: PaymentMethod.BANK_TRANSFER, weight: 12 },
]

const BASE_AMOUNT: Record<ProductCategory, number> = {
  SUBSCRIPTION: 120000,
  SERVICE: 240000,
  HARDWARE: 320000,
  SUPPORT: 90000,
  TRAINING: 150000,
}

// ─── Main seed ─────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.transaction.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()

  // 1. Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Corp',
      slug: 'acme-corp',
    },
  })
  console.log(`  ✓ Tenant: ${tenant.name}`)

  // 2. Create admin user
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@acme.com',
      name: 'Admin Acme',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  })
  console.log(`  ✓ User: ${admin.email} (password: admin123)`)

  // 3. Create viewer user
  const viewerPassword = await hashPassword('viewer123')
  const viewer = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'viewer@acme.com',
      name: 'Viewer Acme',
      passwordHash: viewerPassword,
      role: UserRole.VIEWER,
    },
  })
  console.log(`  ✓ User: ${viewer.email} (password: viewer123)`)

  // 4. Create customers
  const customers = await Promise.all(
    CUSTOMERS.map((customerDef) =>
      prisma.customer.create({
        data: { tenantId: tenant.id, name: customerDef.name, region: customerDef.region },
      }),
    ),
  )
  console.log(`  ✓ Customers: ${customers.length}`)

  // 5. Create products
  const products = await Promise.all(
    PRODUCTS.map((productDef) =>
      prisma.product.create({
        data: { tenantId: tenant.id, name: productDef.name, category: productDef.category },
      }),
    ),
  )
  console.log(`  ✓ Products: ${products.length}`)

  // 6. Build product lookup by category
  const productsByCategory = new Map<ProductCategory, typeof products>()
  for (const product of products) {
    const list = productsByCategory.get(product.category) ?? []
    list.push(product)
    productsByCategory.set(product.category, list)
  }

  // 7. Generate 420 transactions
  const random = createSeededRandom(20260224)
  const startDate = new Date('2025-01-01T00:00:00.000Z')
  const endDate = new Date('2026-02-24T23:59:59.999Z')
  const TOTAL_RECORDS = 420

  const transactionData = []

  for (let index = 0; index < TOTAL_RECORDS; index++) {
    const customer = pickRandom(random, customers)
    const category = pickWeighted(random, CATEGORY_WEIGHTS)
    const paymentMethod = pickWeighted(random, PAYMENT_WEIGHTS)
    const status = pickWeighted(random, STATUS_WEIGHTS)
    const categoryProducts = productsByCategory.get(category) ?? products
    const product = pickRandom(random, categoryProducts)
    const date = randomDate(random, startDate, endDate)

    const variableFactor = 0.7 + random() * 2.4
    const statusFactor = status === TransactionStatus.REFUNDED ? 0.65 : 1
    const amountCents = Math.round(BASE_AMOUNT[category] * variableFactor * statusFactor)

    const dateCode = date.toISOString().slice(0, 10).replace(/-/g, '')
    const txId = `TX-${dateCode}-${String(index + 1).padStart(5, '0')}`

    transactionData.push({
      id: txId,
      tenantId: tenant.id,
      customerId: customer.id,
      productId: product.id,
      date,
      amountCents,
      status,
      paymentMethod,
      description: `${product.name} - ciclo ${String(index + 1).padStart(3, '0')} - ${customer.name}`,
    })
  }

  // Batch insert for performance
  await prisma.transaction.createMany({ data: transactionData })
  console.log(`  ✓ Transactions: ${transactionData.length}`)

  console.log('\n✅ Seed complete!')
  console.log('   Login: admin@acme.com / admin123')
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
