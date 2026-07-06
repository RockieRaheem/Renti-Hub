function pad(n) { return String(n).padStart(2, '0') }

function formatDate() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function esc(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\n/g, '\\n')
    .replace(/[^\x20-\x7E]/g, '')
}

function fmtUGX(v) {
  return `UGX ${(Number(v) || 0).toLocaleString()}`
}

export function downloadPDF({ title, subtitle, head, body, filename, footnote }) {
  const M = 56, PW = 595.28, PH = 841.89
  const CW = PW - 2 * M, LH = 18, HH = 16
  const cols = head.length
  const colW = CW / cols
  const ft = footnote || `Generated on ${formatDate()}`

  // ── Build content streams (handle page breaks) ──
  const streams = []
  let currentStream = []
  let y = M

  function emit(line) { currentStream.push(line) }

  function pageBreak() {
    streams.push(currentStream.join('\n'))
    currentStream = []
    y = M
  }

  function checkPage() {
    if (y + LH > PH - M) pageBreak()
  }

  // Header bar
  emit(`q 0 0 0 rg ${M} ${PH - 20} ${CW} 20 re f Q`)
  emit(`BT /F1 10 Tf 1 1 1 rg ${M + 4} ${PH - 14} Td (RentiHub) Tj ET`)

  // Title
  y = M + 28
  emit(`BT /F1 16 Tf 0 0 0 rg ${M} ${PH - y} Td (${esc(title)}) Tj ET`)
  y += 18

  if (subtitle) {
    emit(`BT /F1 9 Tf 0.37 0.39 0.41 rg ${M} ${PH - y} Td (${esc(subtitle)}) Tj ET`)
    y += 14
  }

  // Divider line
  emit(`${M} ${PH - y} ${CW} 0.5 re S`)
  y += 10

  if (head && body && body.length > 0) {
    // Table header
    emit(`q 0 0.22 0.69 rg ${M} ${PH - y} ${CW} ${HH + 4} re f Q`)
    head.forEach((h, i) => {
      emit(`BT /F1 7.5 Tf 1 1 1 rg ${M + i * colW + 8} ${PH - y + 12} Td (${esc(h)}) Tj ET`)
    })
    y += HH + 4

    // Body rows
    body.forEach((row, ri) => {
      checkPage()
      if (ri % 2 === 0) {
        emit(`q 0.97 0.97 0.98 rg ${M} ${PH - y} ${CW} ${LH + 2} re f Q`)
      }
      row.forEach((cell, ci) => {
        emit(`BT /F1 8 Tf 0 0 0 rg ${M + ci * colW + 8} ${PH - y + 12} Td (${esc(cell)}) Tj ET`)
      })
      emit(`${M} ${PH - y} ${CW} 0.3 re S`)
      y += LH + 2
    })
  } else {
    emit(`BT /F1 10 Tf 0.6 0.63 0.65 rg ${M} ${PH - y - 6} Td (No data available) Tj ET`)
    y += 16
  }

  // Footer
  y += 6
  checkPage()
  emit(`${M} ${PH - y} ${CW} 0.3 re S`)
  y += 4
  emit(`BT /F1 7 Tf 0.6 0.63 0.65 rg ${M} ${PH - y - 2} Td (${esc(ft)}) Tj ET`)
  emit(`BT /F1 7 Tf 0.6 0.63 0.65 rg ${M + CW - 80} ${PH - y - 2} Td (RentiHub) Tj ET`)

  // Push last page
  streams.push(currentStream.join('\n'))

  // ── Build PDF objects in correct order ──
  // Layout: [Pages(1), Font(2), {Stream(3), Page(4)}, {Stream(5), Page(6)}, ..., Catalog(N)]
  // For page index i: Page obj = 4 + 2*i, Stream obj = 3 + 2*i

  const pages = streams.length
  const objs = []

  function add(data) { objs.push(data); return objs.length }

  // obj 1: Pages tree — Kids refs are [4 0 R, 6 0 R, ...] for pages 0, 1, 2...
  const kids = Array.from({ length: pages }, (_, i) => `${4 + 2 * i} 0 R`).join(' ')
  add(`<</Type /Pages /Kids [${kids}] /Count ${pages}>>`)

  // obj 2: Font
  add(`<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>`)

  // objs 3,5,7...: streams; 4,6,8...: pages
  for (let p = 0; p < pages; p++) {
    const streamLen = streams[p].length
    const streamObjNum = add(`<</Length ${streamLen}>>\nstream\n${streams[p]}\nendstream`)
    add(`<</Type /Page /Parent 1 0 R /MediaBox [0 0 ${PW} ${PH}] /Contents ${streamObjNum} 0 R /Resources<</Font<</F1 2 0 R>>>>>>`)
  }

  // obj (last): Catalog
  const catalogNum = add(`<</Type /Catalog /Pages 1 0 R>>`)

  // ── Serialize ──
  let pdf = '%PDF-1.4\n'
  const offsets = []
  for (let i = 0; i < objs.length; i++) {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj ${objs[i]}\nendobj\n`
  }

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`
  for (let i = 0; i < objs.length; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n'
  }
  pdf += `trailer\n<</Size ${objs.length + 1} /Root ${catalogNum} 0 R>>\n`
  pdf += `startxref\n${xrefOffset}\n%%EOF`

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
    t.name || '', t.unit || '', t.floor || '',
    fmtUGX(t.monthlyRent || 0),
    t.paid ? 'Paid' : 'Overdue',
    t.outstandingBalance > 0 ? fmtUGX(t.outstandingBalance) : '-',
    t.lastPaymentDate || '-',
  ])
  const totalOut = tenants.reduce((s, t) => s + (t.outstandingBalance || 0), 0)
  downloadPDF({
    title: 'Tenant Rent Report',
    subtitle: `Total tenants: ${tenants.length} | Outstanding: ${totalOut.toLocaleString()} UGX`,
    head, body,
    filename: 'rentihub_tenants.pdf',
  })
}

export function downloadPaymentPDF(payments) {
  const head = ['Tenant', 'Unit', 'Floor', 'Amount', 'Method', 'Date']
  const body = (payments || []).map((p) => [
    p.tenantName || '', p.unit || '', p.floor || '',
    fmtUGX(p.amount || 0), p.method || '-', p.date || '-',
  ])
  const total = (payments || []).reduce((s, p) => s + (p.amount || 0), 0)
  downloadPDF({
    title: 'Payment History',
    subtitle: `Total payments: ${payments.length} | Total collected: ${total.toLocaleString()} UGX`,
    head, body,
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
  const body = rows.map((r) => [r.floor, r.unit, r.tenant, fmtUGX(r.monthlyRent), r.status])
  const total = rows.reduce((s, r) => s + r.monthlyRent, 0)
  downloadPDF({
    title: 'Revenue by Floor',
    subtitle: `Total monthly revenue: ${total.toLocaleString()} UGX`,
    head, body,
    filename: 'rentihub_revenue.pdf',
  })
}
