import type { ReportTransaction } from '@/types/reports'
import {
  REPORT_CATEGORY_LABELS,
  REPORT_PAYMENT_METHOD_LABELS,
  REPORT_STATUS_LABELS,
} from '@/types/reports'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapePdf(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function normalizeAscii(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value)
}

function buildExcelCell(value: string): string {
  return `<td>${escapeHtml(value)}</td>`
}

function pad(value: string, size: number, alignEnd = false): string {
  if (value.length >= size) {
    return value.slice(0, size - 1).concat('~')
  }

  return alignEnd ? value.padStart(size, ' ') : value.padEnd(size, ' ')
}

function buildPdfPage(lines: string[]): string {
  const textOperations: string[] = ['BT', '/F1 8.5 Tf', '50 800 Td']

  lines.forEach((line, index) => {
    if (index > 0) {
      textOperations.push('0 -14 Td')
    }

    textOperations.push(`(${escapePdf(normalizeAscii(line))}) Tj`)
  })

  textOperations.push('ET')

  return textOperations.join('\n')
}

function buildPdfDocument(pageContents: string[]): string {
  const objects: string[] = ['', '', '', '']
  const pageIds: number[] = []

  for (const pageContent of pageContents) {
    const contentId = objects.length
    objects.push(`<< /Length ${pageContent.length} >>\nstream\n${pageContent}\nendstream`)

    const pageId = objects.length
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R >> >> >>`,
    )
    pageIds.push(pageId)
  }

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>'

  let document = '%PDF-1.4\n'
  const offsets: number[] = [0]

  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = document.length
    document += `${id} 0 obj\n${objects[id]}\nendobj\n`
  }

  const xrefOffset = document.length
  document += `xref\n0 ${objects.length}\n0000000000 65535 f \n`

  for (let id = 1; id < objects.length; id += 1) {
    document += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
  }

  document += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return document
}

export function exportTransactionsToExcel(transactions: ReportTransaction[]): void {
  const rows = transactions
    .map((transaction) => {
      return [
        buildExcelCell(formatDate(transaction.date)),
        buildExcelCell(transaction.id),
        buildExcelCell(transaction.customerName),
        buildExcelCell(REPORT_CATEGORY_LABELS[transaction.category]),
        buildExcelCell(REPORT_STATUS_LABELS[transaction.status]),
        buildExcelCell(REPORT_PAYMENT_METHOD_LABELS[transaction.paymentMethod]),
        buildExcelCell(formatCurrency(transaction.amount)),
        buildExcelCell(transaction.description),
      ].join('')
    })
    .join('')

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>
              <th>Data</th>
              <th>ID</th>
              <th>Cliente</th>
              <th>Categoria</th>
              <th>Status</th>
              <th>Pagamento</th>
              <th>Valor</th>
              <th>Descricao</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `.trim()

  const blob = new Blob([`\uFEFF${html}`], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  })

  downloadBlob(blob, 'relatorio-detalhado.xls')
}

export function exportTransactionsToPdf(transactions: ReportTransaction[]): void {
  const linesPerPage = 48
  const lines: string[] = [
    'Relatorio detalhado de transacoes',
    `Gerado em: ${formatDate(new Date().toISOString())}`,
    '',
    `${pad('Data', 16)} ${pad('ID', 18)} ${pad('Cliente', 22)} ${pad('Categoria', 12)} ${pad('Status', 10)} ${pad('Valor', 12, true)}`,
    ''.padEnd(98, '-'),
  ]

  for (const transaction of transactions) {
    lines.push(
      `${pad(formatDate(transaction.date), 16)} ${pad(transaction.id, 18)} ${pad(transaction.customerName, 22)} ${pad(REPORT_CATEGORY_LABELS[transaction.category], 12)} ${pad(REPORT_STATUS_LABELS[transaction.status], 10)} ${pad(formatCurrency(transaction.amount), 12, true)}`,
    )
  }

  const pageContents: string[] = []

  for (let index = 0; index < lines.length; index += linesPerPage) {
    const pageLines = lines.slice(index, index + linesPerPage)
    pageContents.push(buildPdfPage(pageLines))
  }

  const pdfContent = buildPdfDocument(pageContents)
  const blob = new Blob([pdfContent], { type: 'application/pdf' })
  downloadBlob(blob, 'relatorio-detalhado.pdf')
}
