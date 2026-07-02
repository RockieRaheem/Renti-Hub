import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

function formatUGX(v) {
  const n = Number(v) || 0
  return `UGX ${n.toLocaleString()}`
}

export function downloadPDF({ title, subtitle, head, body, filename, footnote }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 16
  const contentW = pageW - margin * 2
  let y = margin

  // Header bar
  doc.setFillColor(0, 55, 176)
  doc.rect(0, 0, pageW, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('RentiHub', margin, 5.5)

  // Title
  y += 8
  doc.setTextColor(25, 28, 29)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(title, margin, y + 4)
  y += 10

  if (subtitle) {
    doc.setTextColor(95, 99, 104)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(subtitle, margin, y + 2)
    y += 6
  }

  // Divider line
  doc.setDrawColor(218, 220, 224)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageW - margin, y)
  y += 4

  // Table
  if (head && body && body.length) {
    doc.autoTable({
      head: [head],
      body,
      startY: y,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
        textColor: [25, 28, 29],
        lineColor: [218, 220, 224],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [0, 55, 176],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'left',
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      columnStyles: {},
      tableLineColor: [218, 220, 224],
      tableLineWidth: 0.3,
    })
    y = doc.lastAutoTable.finalY + 6
  } else {
    doc.setFontSize(10)
    doc.setTextColor(154, 160, 166)
    doc.text('No data available', margin, y + 6)
    y += 12
  }

  // Footer
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  doc.setDrawColor(218, 220, 224)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageW - margin, y)
  y += 3
  doc.setTextColor(154, 160, 166)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')

  const leftText = footnote || `Generated on ${dateStr} at ${timeStr}`
  doc.text(leftText, margin, y + 2)
  doc.text('RentiHub — rentihub.app', pageW - margin, y + 2, { align: 'right' })

  // Page numbers
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(154, 160, 166)
    doc.text(`Page ${i} of ${totalPages}`, pageW / 2, y + 2, { align: 'center' })
  }

  doc.save(filename)
}

export function downloadTenantPDF(tenants) {
  const head = ['Tenant', 'Unit', 'Floor', 'Monthly Rent', 'Status', 'Outstanding', 'Last Payment']
  const body = tenants.map((t) => [
    t.name || '',
    t.unit || '',
    t.floor || '',
    formatUGX(t.monthlyRent || 0),
    (t.paid ? 'Paid' : 'Overdue'),
    t.outstandingBalance > 0 ? formatUGX(t.outstandingBalance) : '—',
    t.lastPaymentDate || '—',
  ])
  downloadPDF({
    title: 'Tenant Rent Report',
    subtitle: `Total tenants: ${tenants.length} | Outstanding: ${tenants.reduce((s, t) => s + (t.outstandingBalance || 0), 0).toLocaleString()} UGX`,
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
