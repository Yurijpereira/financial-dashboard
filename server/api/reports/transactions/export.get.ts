import { z } from 'zod'
import { prisma } from '@/server/utils/prisma'
import { requirePermission } from '@/server/utils/rbacGuards'
import {
  TransactionFilterSchema,
  buildTransactionWhere,
  buildTransactionOrderBy,
  toLowerStatus,
  toLowerCategory,
  toLowerPayment,
} from '@/server/utils/reportFilters'
import type { ReportTransaction } from '@/types/reports'
import {
  REPORT_CATEGORY_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_PAYMENT_METHOD_LABELS,
} from '@/types/reports'

const MAX_EXPORT_ROWS = 50_000

const ExportQuerySchema = TransactionFilterSchema.extend({
  format: z.enum(['csv', 'pdf']),
  sortField: z.enum(['date', 'amount', 'customerName', 'status']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// ─── CSV helpers ──────────────────────────────────────────────────

function escapeCsvField(value: string): string {
  if (value.includes('"') || value.includes(';') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatDateBR(isoDate: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(isoDate))
}

function formatCurrencyBR(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value)
}

const CSV_HEADERS = [
  'Data',
  'ID',
  'Cliente',
  'Região',
  'Produto',
  'Categoria',
  'Status',
  'Pagamento',
  'Valor (R$)',
  'Descrição',
] as const

function buildCsvContent(transactions: ReportTransaction[]): string {
  const header = CSV_HEADERS.map(escapeCsvField).join(';')

  const rows = transactions.map((t) =>
    [
      formatDateBR(t.date),
      t.id,
      t.customerName,
      t.region,
      t.product,
      REPORT_CATEGORY_LABELS[t.category],
      REPORT_STATUS_LABELS[t.status],
      REPORT_PAYMENT_METHOD_LABELS[t.paymentMethod],
      t.amount.toFixed(2).replace('.', ','),
      t.description,
    ]
      .map(escapeCsvField)
      .join(';'),
  )

  return [header, ...rows].join('\r\n')
}

// ─── PDF helpers (pure ASCII, no DOM dependency) ──────────────────

function escapePdfStr(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function normalizeAscii(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
}

function padField(value: string, size: number, alignEnd = false): string {
  if (value.length >= size) return value.slice(0, size - 1) + '~'
  return alignEnd ? value.padStart(size, ' ') : value.padEnd(size, ' ')
}

function buildPdfPage(lines: string[]): string {
  const ops: string[] = ['BT', '/F1 8.5 Tf', '50 800 Td']

  lines.forEach((line, i) => {
    if (i > 0) ops.push('0 -14 Td')
    ops.push(`(${escapePdfStr(normalizeAscii(line))}) Tj`)
  })

  ops.push('ET')
  return ops.join('\n')
}

function buildPdfDocument(pageContents: string[]): string {
  const objects: string[] = ['', '', '', '']
  const pageIds: number[] = []

  for (const content of pageContents) {
    const contentId = objects.length
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)

    const pageId = objects.length
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R >> >> >>`,
    )
    pageIds.push(pageId)
  }

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>'

  let doc = '%PDF-1.4\n'
  const offsets: number[] = [0]

  for (let id = 1; id < objects.length; id++) {
    offsets[id] = doc.length
    doc += `${id} 0 obj\n${objects[id]}\nendobj\n`
  }

  const xrefOffset = doc.length
  doc += `xref\n0 ${objects.length}\n0000000000 65535 f \n`

  for (let id = 1; id < objects.length; id++) {
    doc += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
  }

  doc += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return doc
}

function buildPdfBuffer(transactions: ReportTransaction[]): Buffer {
  const LINES_PER_PAGE = 48
  const now = formatDateBR(new Date().toISOString())

  const lines: string[] = [
    'Relatorio detalhado de transacoes',
    `Gerado em: ${now}`,
    '',
    `${padField('Data', 16)} ${padField('ID', 18)} ${padField('Cliente', 22)} ${padField('Categoria', 14)} ${padField('Status', 10)} ${padField('Valor', 16, true)}`,
    ''.padEnd(98, '-'),
  ]

  for (const t of transactions) {
    lines.push(
      `${padField(formatDateBR(t.date), 16)} ${padField(t.id, 18)} ${padField(t.customerName, 22)} ${padField(REPORT_CATEGORY_LABELS[t.category], 14)} ${padField(REPORT_STATUS_LABELS[t.status], 10)} ${padField(formatCurrencyBR(t.amount), 16, true)}`,
    )
  }

  const pages: string[] = []
  for (let i = 0; i < lines.length; i += LINES_PER_PAGE) {
    pages.push(buildPdfPage(lines.slice(i, i + LINES_PER_PAGE)))
  }

  return Buffer.from(buildPdfDocument(pages), 'utf-8')
}

// ─── Handler ──────────────────────────────────────────────────────

export default defineEventHandler(async (event) => {
  requirePermission(event, 'reports:export')

  const tenantId = event.context.tenantId as string
  const raw = getQuery(event)
  const result = ExportQuerySchema.safeParse(raw)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Parâmetros inválidos',
      data: result.error.issues,
    })
  }

  const query = result.data
  const where = buildTransactionWhere(query, tenantId)

  const count = await prisma.transaction.count({ where })

  if (count > MAX_EXPORT_ROWS) {
    throw createError({
      statusCode: 422,
      message: `A exportação está limitada a ${MAX_EXPORT_ROWS.toLocaleString('pt-BR')} registros. Aplique filtros para reduzir o volume de dados.`,
    })
  }

  try {
    const items = await prisma.transaction.findMany({
      where,
      include: { customer: true, product: true },
      orderBy: buildTransactionOrderBy(query.sortField, query.sortOrder),
    })

    const transactions: ReportTransaction[] = items.map((t) => ({
      id: t.id,
      date: t.date.toISOString(),
      customerId: t.customerId,
      customerName: t.customer.name,
      region: t.customer.region,
      productId: t.productId,
      product: t.product.name,
      category: toLowerCategory(t.product.category),
      paymentMethod: toLowerPayment(t.paymentMethod),
      status: toLowerStatus(t.status),
      amount: t.amountCents / 100,
      description: t.description,
    }))

    if (query.format === 'csv') {
      const buffer = Buffer.from('\uFEFF' + buildCsvContent(transactions), 'utf-8')

      setResponseHeaders(event, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="relatorio-transacoes.csv"',
        'Content-Length': String(buffer.length),
      })

      return buffer
    }

    const pdfBuffer = buildPdfBuffer(transactions)

    setResponseHeaders(event, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="relatorio-transacoes.pdf"',
      'Content-Length': String(pdfBuffer.length),
    })

    return pdfBuffer
  } catch (error) {
    console.error('Export endpoint error:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro interno ao gerar exportação',
    })
  }
})
