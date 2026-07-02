function pad(n) { return String(n).padStart(2, '0') }

function formatDate() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function escapePDF(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\n/g, '\\n')
}

function formatUGX(v) {
  const n = Number(v) || 0
  return `UGX ${n.toLocaleString()}`
}

// Minimal PDF generator — produces a clean A4 portrait PDF with a table
export function downloadPDF({ title, subtitle, head, body, filename, footnote }) {
  const pageW = 595.28 // A4 width in points
  const pageH = 841.89
  const margin = 56
  const contentW = pageW - margin * 2
  const lineH = 14
  const fontSize = 10
  const headerH = 7
  const colCount = head.length
  const colW = contentW / colCount

  let y = margin
  let pages = 1
  let output = ''

  // Helper: start a new page
  function addPage() {
    output += '3 0 obj\n<</Type /Page /Parent 1 0 R /MediaBox [0 0 ' + pageW + ' ' + pageH + '] /Contents 4 0 R /Resources<</Font<</F1 2 0 R>>>>>>endobj\n'
  }

  // Build PDF content stream
  let stream = ''
  function text(x, y, str, size, bold) {
    stream += 'BT\n'
    stream += `/F1 ${size} Tf\n`
    if (bold) stream += '80 0 0 80 0 0 Tm\n' // simulate bold by scaling (simplified)
    stream += `${x} ${pageH - y} Td\n`
    stream += `(${escapePDF(str)}) Tj\n`
    stream += 'ET\n'
  }

  function rect(x, y, w, h, fill) {
    stream += `${x} ${pageH - y} ${w} ${-h} re\n`
    stream += fill ? 'f\n' : 'S\n'
  }

  function checkPage() {
    if (y + lineH > pageH - margin) {
      stream += '0 0 0 rg\n'
      text(margin, y, `Page ${pages}`, 7)
      pages++
      addPage()
      y = margin
    }
  }

  // Header bar
  stream += '0 0 0 rg\n'
  rect(0, 0, pageW, 20, true)
  stream += '1 1 1 rg\n'
  text(margin, 14, 'RentiHub', 10, true)

  // Title
  y += 28
  stream += '0 0 0 rg\n'
  text(margin, y, title, 16, true)
  y += 18

  if (subtitle) {
    stream += '0.37 0.39 0.41 rg\n'
    text(margin, y, subtitle, 9)
    y += 12
  }

  // Divider line
  stream += '0.85 0.86 0.88 RG\n'
  rect(margin, y, contentW, 0.5)
  y += 10

  // Table header
  if (head && body && body.length) {
    stream += '0 0.22 0.69 rg\n'
    rect(margin, y, contentW, headerH + 4, true)
    stream += '1 1 1 rg\n'
    head.forEach((h, i) => {
      text(margin + i * colW + 4, y + 5, h, 7.5, true)
    })

    y += headerH + 4

    // Table rows
    body.forEach((row, ri) => {
      checkPage()
      // Alternate row bg
      if (ri % 2 === 0) {
        stream += '0.97 0.97 0.98 rg\n'
        rect(margin, y, contentW, lineH + 2, true)
      }
      stream += '0 0 0 rg\n'
      row.forEach((cell, ci) => {
        checkPage()
        text(margin + ci * colW + 4, y + 5, String(cell ?? ''), 8)
      })
      // Row border
      stream += '0.85 0.86 0.88 RG\n'
      rect(margin, y, contentW, 0.3)
      y += lineH + 2
    })
  } else {
    stream += '0.6 0.63 0.65 rg\n'
    text(margin, y + 6, 'No data available', 10)
    y += 14
  }

  // Separator before footer
  y += 6
  checkPage()
  stream += '0.85 0.86 0.88 RG\n'
  rect(margin, y, contentW, 0.3)
  y += 4

  // Footer
  const dateStr = formatDate()
  const footnoteText = footnote || `Generated on ${dateStr}`
  stream += '0.6 0.63 0.65 rg\n'
  text(margin, y + 2, footnoteText, 7)
  text(margin + contentW - 80, y + 2, 'RentiHub - rentihub.app', 7)

  // Page numbers
  text(margin + contentW / 2 - 15, y + 2, `Page 1 of ${pages}`, 7)

  // Build final PDF
  const contentLength = stream.length
  const objects = [
    '1 0 obj\n<</Type /Pages /Kids [3 0 R] /Count ' + pages + '>>\nendobj',
    '2 0 obj\n<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>\nendobj',
  ]

  for (let p = 0; p < pages; p++) {
    objects.push('3 0 obj\n<</Type /Page /Parent 1 0 R /MediaBox [0 0 ' + pageW + ' ' + pageH + '] /Contents 4 0 R /Resources<</Font<</F1 2 0 R>>>>>>endobj')
  }

  const streamObj = '4 0 obj\n<</Length ' + contentLength + '>>\nstream\n' + stream + '\nendstream\nendobj'
  objects.push(streamObj)

  const xrefOffset = 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n'
  let offset = 0
  const offsets = ['0000000000']
  objects.forEach((obj, i) => {
    offsets.push(String(offset).padStart(10, '0'))
    offset += obj.length + 1
  })

  const xref = 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n' +
    objects.map((_, i) => offsets[i + 1] + ' 00000 n \n').join('')

  const trailer = 'trailer\n<</Size ' + (objects.length + 1) + ' /Root 1 0 R>>\n'

  const pdf = '%PDF-1.4\n' +
    objects.join('\n') + '\n' +
    xref +
    trailer +
    'startxref\n' + offset + '\n%%EOF'

  const blob = new Blob([pdf], { type: 'application/pdf' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

export function downloadTenantPDF(tenants) {
  const head = ['Tenant', 'Unit', 'Floor', 'Monthly Rent', 'Status', 'Outstanding', 'Last Payment']
  const body = tenants.map((t) => [
    t.name || '',
    t.unit || '',
    t.floor || '',
    formatUGX(t.monthlyRent || 0),
    t.paid ? 'Paid' : 'Overdue',
    t.outstandingBalance > 0 ? formatUGX(t.outstandingBalance) : '—',
    t.lastPaymentDate || '—',
  ])
  const totalOutstanding = tenants.reduce((s, t) => s + (t.outstandingBalance || 0), 0)
  downloadPDF({
    title: 'Tenant Rent Report',
    subtitle: `Total tenants: ${tenants.length} | Outstanding: ${totalOutstanding.toLocaleString()} UGX`,
    head,
    body,
    filename: 'rentihub_tenants.pdf',
  })
}

export function downloadPaymentPDF(payments) {
  const head = ['Tenant', 'Unit', 'Floor', 'Amount', 'Method', 'Date']
  const body = (payments || []).map((p) => [
    p.tenantName || '',
    p.unit || '',
    p.floor || '',
    formatUGX(p.amount || 0),
    p.method || '—',
    p.date || '—',
  ])
  const total = (payments || []).reduce((s, p) => s + (p.amount || 0), 0)
  downloadPDF({
    title: 'Payment History',
    subtitle: `Total payments: ${payments.length} | Total collected: ${total.toLocaleString()} UGX`,
    head,
    body,
    filename: 'rentihub_payments.pdf',
  })
}

export function downloadRevenuePDF(floors) {
  const rows = floors.flatMap((f) =>
    f.units.filter((u) => u.tenant).map((u) => ({
      floor: f.name, unit: u.name, tenant: u.tenant.name,
      monthlyRent: u.monthlyRent || 0,
      status: (u.tenant.outstandingBalance || 0) > 0 ? 'Outstanding' : 'Paid',
    }))
  )
  const head = ['Floor', 'Unit', 'Tenant', 'Monthly Rent', 'Status']
  const body = rows.map((r) => [r.floor, r.unit, r.tenant, formatUGX(r.monthlyRent), r.status])
  const total = rows.reduce((s, r) => s + r.monthlyRent, 0)
  downloadPDF({
    title: 'Revenue by Floor',
    subtitle: `Total monthly revenue: ${total.toLocaleString()} UGX`,
    head,
    body,
    filename: 'rentihub_revenue.pdf',
  })
}
