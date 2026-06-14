const PDFDocument = require('pdfkit')
const prisma      = require('../utils/prisma')

// ─── Helper Functions ────────────────────────────────────────────

const addPageHeader = (doc, title, color, isLandscape = true) => {
  const width = isLandscape ? 842 : 612
  doc.rect(0, 0, width, 60).fill(color)
  doc.fillColor('white')
     .fontSize(20)
     .font('Helvetica-Bold')
     .text(title, 40, 18)
  doc.fontSize(10)
     .font('Helvetica')
     .text(`Generated: ${new Date().toLocaleString()}  |  AssetIQ System`, 40, 42)
  doc.fillColor('#1F2937')
}

const addStatsBar = (doc, statsText, y = 72) => {
  doc.rect(40, y, 762, 20).fill('#F1F5F9')
  doc.fillColor('#374151')
     .fontSize(9)
     .font('Helvetica')
     .text(statsText, 48, y + 5)
  doc.fillColor('#1F2937')
}

const addTableHeader = (doc, headers, widths, y, color = '#1E40AF') => {
  doc.rect(40, y - 3, widths.reduce((a, b) => a + b, 0), 20).fill(color)
  doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
  let x = 40
  headers.forEach((h, i) => {
    doc.text(h, x + 4, y + 2, { width: widths[i] - 8, ellipsis: true })
    x += widths[i]
  })
  doc.fillColor('#1F2937').font('Helvetica')
}

const addTableRow = (doc, cols, widths, y, isEven = false) => {
  const totalWidth = widths.reduce((a, b) => a + b, 0)
  if (isEven) {
    doc.rect(40, y - 3, totalWidth, 18).fill('#F8FAFC')
  }
  doc.fillColor('#374151').fontSize(8).font('Helvetica')
  let x = 40
  cols.forEach((col, i) => {
    doc.text(String(col || '—').substring(0, 25), x + 4, y + 1, {
      width: widths[i] - 8,
      ellipsis: true
    })
    x += widths[i]
  })
  doc.moveTo(40, y + 15)
     .lineTo(40 + totalWidth, y + 15)
     .strokeColor('#E2E8F0')
     .lineWidth(0.5)
     .stroke()
  doc.fillColor('#1F2937').strokeColor('#000000').lineWidth(1)
}

const checkNewPage = (doc, y, limit, headers, widths, color, layout = 'landscape') => {
  if (y > limit) {
    doc.addPage({ layout })
    const newY = 40
    addTableHeader(doc, headers, widths, newY, color)
    return newY + 22
  }
  return y
}

// ─── Controllers ────────────────────────────────────────────────

const getAssetReport = async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        supplier: { select: { name: true } },
        assignments: {
          where: { isActive: true },
          include: {
            employee: { include: { user: { select: { name: true } } } }
          }
        }
      },
      orderBy: { assetCode: 'asc' }
    })

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=AssetIQ_Asset_Report.pdf')
    doc.pipe(res)

    // Header
    addPageHeader(doc, 'AssetIQ — Asset Inventory Report', '#1E40AF')

    // Stats
    const available   = assets.filter(a => a.status === 'AVAILABLE').length
    const assigned    = assets.filter(a => a.status === 'ASSIGNED').length
    const underRepair = assets.filter(a => a.status === 'UNDER_REPAIR').length
    const avgHealth   = assets.length
      ? Math.round(assets.reduce((s, a) => s + a.healthScore, 0) / assets.length)
      : 0

    addStatsBar(doc,
      `Total: ${assets.length}   |   Available: ${available}   |   Assigned: ${assigned}   |   Under Repair: ${underRepair}   |   Avg Health: ${avgHealth}%`
    )

    // Table
    const widths  = [65, 140, 75, 75, 85, 65, 110, 80]
    const headers = ['Code', 'Asset Name', 'Type', 'Brand', 'Status', 'Health', 'Assigned To', 'Warranty']
    const COLOR   = '#1E40AF'

    let y = 100
    addTableHeader(doc, headers, widths, y, COLOR)
    y += 22

    assets.forEach((asset, i) => {
      y = checkNewPage(doc, y, 535, headers, widths, COLOR)
      addTableRow(doc, [
        asset.assetCode,
        asset.name,
        asset.type,
        asset.brand,
        asset.status?.replace(/_/g, ' '),
        `${asset.healthScore}/100`,
        asset.assignments?.[0]?.employee?.user?.name || '—',
        new Date(asset.warrantyExpiry).toLocaleDateString('en-IN')
      ], widths, y, i % 2 === 0)
      y += 18
    })

    // Footer
    doc.fontSize(8).fillColor('#94A3B8')
       .text('Confidential — AssetIQ System Report', 40, 555, { align: 'center' })

    doc.end()
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const getEmployeeReport = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
        assignments: {
          where: { isActive: true },
          include: { asset: { select: { name: true, assetCode: true } } }
        }
      },
      orderBy: { employeeCode: 'asc' }
    })

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=AssetIQ_Employee_Report.pdf')
    doc.pipe(res)

    addPageHeader(doc, 'AssetIQ — Employee Report', '#065F46')

    const active  = employees.filter(e => e.isActive).length
    const exiting = employees.filter(e => e.exitDate).length
    const withAssets = employees.filter(e => e.assignments?.length > 0).length

    addStatsBar(doc,
      `Total: ${employees.length}   |   Active: ${active}   |   Exiting: ${exiting}   |   With Assets: ${withAssets}`
    )

    const widths  = [60, 120, 95, 115, 95, 65, 80, 65]
    const headers = ['Code', 'Name', 'Department', 'Email', 'Designation', 'Status', 'Assets', 'Exit Date']
    const COLOR   = '#065F46'

    let y = 100
    addTableHeader(doc, headers, widths, y, COLOR)
    y += 22

    employees.forEach((emp, i) => {
      y = checkNewPage(doc, y, 535, headers, widths, COLOR)
      addTableRow(doc, [
        emp.employeeCode,
        emp.user?.name,
        emp.department,
        emp.user?.email,
        emp.designation,
        emp.isActive ? 'Active' : 'Inactive',
        emp.assignments?.map(a => a.asset?.assetCode).join(', ') || '—',
        emp.exitDate ? new Date(emp.exitDate).toLocaleDateString('en-IN') : '—'
      ], widths, y, i % 2 === 0)
      y += 18
    })

    doc.fontSize(8).fillColor('#94A3B8')
       .text('Confidential — AssetIQ System Report', 40, 555, { align: 'center' })

    doc.end()
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const getDamageReport = async (req, res) => {
  try {
    const reports = await prisma.damageReport.findMany({
      include: {
        asset:    { select: { name: true, assetCode: true } },
        employee: { include: { user: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=AssetIQ_Damage_Report.pdf')
    doc.pipe(res)

    addPageHeader(doc, 'AssetIQ — Damage Report Summary', '#991B1B')

    const open      = reports.filter(r => r.status === 'OPEN').length
    const reviewing = reports.filter(r => r.status === 'UNDER_REVIEW').length
    const resolved  = reports.filter(r => r.status === 'RESOLVED').length
    const totalCost = reports.reduce((s, r) => s + (r.repairCost || 0), 0)

    addStatsBar(doc,
      `Total: ${reports.length}   |   Open: ${open}   |   Under Review: ${reviewing}   |   Resolved: ${resolved}   |   Total Repair Cost: Rs.${totalCost}`
    )

    const widths  = [80, 140, 95, 190, 90, 85]
    const headers = ['Asset Code', 'Asset Name', 'Reported By', 'Description', 'Status', 'Repair Cost']
    const COLOR   = '#991B1B'

    let y = 100
    addTableHeader(doc, headers, widths, y, COLOR)
    y += 22

    reports.forEach((r, i) => {
      y = checkNewPage(doc, y, 535, headers, widths, COLOR)
      addTableRow(doc, [
        r.asset?.assetCode,
        r.asset?.name,
        r.employee?.user?.name,
        r.description,
        r.status?.replace(/_/g, ' '),
        r.repairCost ? `Rs.${r.repairCost}` : '—'
      ], widths, y, i % 2 === 0)
      y += 18
    })

    doc.fontSize(8).fillColor('#94A3B8')
       .text('Confidential — AssetIQ System Report', 40, 555, { align: 'center' })

    doc.end()
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const getFullReport = async (req, res) => {
  try {
    const [assets, employees, damage, assignments] = await Promise.all([
      prisma.asset.findMany({
        include: {
          supplier: true,
          assignments: { where: { isActive: true }, include: { employee: { include: { user: true } } } }
        }
      }),
      prisma.employee.findMany({
        include: { user: true, assignments: { where: { isActive: true } } }
      }),
      prisma.damageReport.findMany({
        include: { asset: true, employee: { include: { user: true } } }
      }),
      prisma.assignment.findMany({ where: { isActive: true } })
    ])

    const doc = new PDFDocument({ margin: 40, size: 'A4' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=AssetIQ_Full_Report.pdf')
    doc.pipe(res)

    // ── Cover Page ──────────────────────────────
    doc.rect(0, 0, 612, 792).fill('#0F172A')
    doc.rect(0, 300, 612, 200).fill('#1E3A8A')

    doc.fillColor('#60A5FA')
       .fontSize(11)
       .font('Helvetica')
       .text('CONFIDENTIAL', 0, 220, { align: 'center' })

    doc.fillColor('white')
       .fontSize(42)
       .font('Helvetica-Bold')
       .text('AssetIQ', 0, 280, { align: 'center' })

    doc.fillColor('#93C5FD')
       .fontSize(16)
       .font('Helvetica')
       .text('Complete System Report', 0, 335, { align: 'center' })

    doc.fillColor('#CBD5E1')
       .fontSize(11)
       .text(new Date().toDateString(), 0, 365, { align: 'center' })

    // Summary boxes
    const boxData = [
      { label: 'Assets',      value: assets.length,      x: 80  },
      { label: 'Employees',   value: employees.length,   x: 220 },
      { label: 'Assignments', value: assignments.length, x: 360 },
      { label: 'Damage',      value: damage.length,      x: 490 },
    ]
    boxData.forEach(b => {
      doc.rect(b.x, 430, 100, 60).fill('#1E3A8A').stroke('#3B82F6')
      doc.fillColor('white').fontSize(24).font('Helvetica-Bold')
         .text(String(b.value), b.x, 443, { width: 100, align: 'center' })
      doc.fontSize(9).font('Helvetica')
         .text(b.label, b.x, 468, { width: 100, align: 'center' })
    })

    doc.fillColor('#64748B').fontSize(9)
       .text('Generated by AssetIQ — IT Asset Management System', 0, 740, { align: 'center' })

    // ── Executive Summary Page ──────────────────
    doc.addPage()
    doc.rect(0, 0, 612, 50).fill('#1E3A8A')
    doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
       .text('Executive Summary', 40, 16)
    doc.fillColor('#1F2937')

    const summaryData = [
      ['ASSET OVERVIEW',    null],
      ['Total Assets',      assets.length],
      ['Available',         assets.filter(a => a.status === 'AVAILABLE').length],
      ['Assigned',          assets.filter(a => a.status === 'ASSIGNED').length],
      ['Under Repair',      assets.filter(a => a.status === 'UNDER_REPAIR').length],
      ['Avg Health Score',  `${Math.round(assets.reduce((s,a) => s + a.healthScore, 0) / (assets.length || 1))}%`],
      ['EMPLOYEE OVERVIEW', null],
      ['Total Employees',   employees.length],
      ['Active',            employees.filter(e => e.isActive).length],
      ['Exiting',           employees.filter(e => e.exitDate).length],
      ['OPERATIONS',        null],
      ['Active Assignments', assignments.length],
      ['Total Damage Reports', damage.length],
      ['Resolved Damage',   damage.filter(d => d.status === 'RESOLVED').length],
      ['Open Damage',       damage.filter(d => d.status === 'OPEN').length],
    ]

    let y = 65
    summaryData.forEach(([label, value]) => {
      if (value === null) {
        doc.rect(40, y, 532, 22).fill('#1E3A8A')
        doc.fillColor('white').fontSize(10).font('Helvetica-Bold')
           .text(label, 50, y + 6)
        doc.fillColor('#1F2937')
        y += 28
      } else {
        const rowColor = y % 36 === 0 ? '#F8FAFC' : '#FFFFFF'
        doc.rect(40, y, 532, 22).fill(rowColor)
        doc.fillColor('#374151').fontSize(10).font('Helvetica')
           .text(label, 55, y + 6)
        doc.fillColor('#1D4ED8').font('Helvetica-Bold')
           .text(String(value), 350, y + 6, { width: 150, align: 'right' })
        doc.fillColor('#1F2937')
        y += 22
      }
    })

    // ── Asset Table Page ────────────────────────
    doc.addPage({ layout: 'landscape' })
    addPageHeader(doc, 'Asset Details', '#1E40AF')

    const aWidths  = [65, 140, 75, 75, 85, 65, 110, 80]
    const aHeaders = ['Code', 'Asset Name', 'Type', 'Brand', 'Status', 'Health', 'Assigned To', 'Warranty']

    y = 100
    addTableHeader(doc, aHeaders, aWidths, y, '#1E40AF')
    y += 22

    assets.forEach((asset, i) => {
      y = checkNewPage(doc, y, 535, aHeaders, aWidths, '#1E40AF', 'landscape')
      addTableRow(doc, [
        asset.assetCode,
        asset.name,
        asset.type,
        asset.brand,
        asset.status?.replace(/_/g, ' '),
        `${asset.healthScore}/100`,
        asset.assignments?.[0]?.employee?.user?.name || '—',
        new Date(asset.warrantyExpiry).toLocaleDateString('en-IN')
      ], aWidths, y, i % 2 === 0)
      y += 18
    })

    // ── Employee Table Page ─────────────────────
    doc.addPage({ layout: 'landscape' })
    addPageHeader(doc, 'Employee Details', '#065F46')

    const eWidths  = [60, 120, 95, 115, 95, 65, 80, 65]
    const eHeaders = ['Code', 'Name', 'Department', 'Email', 'Designation', 'Status', 'Assets', 'Exit Date']

    y = 100
    addTableHeader(doc, eHeaders, eWidths, y, '#065F46')
    y += 22

    employees.forEach((emp, i) => {
      y = checkNewPage(doc, y, 535, eHeaders, eWidths, '#065F46', 'landscape')
      addTableRow(doc, [
        emp.employeeCode,
        emp.user?.name,
        emp.department,
        emp.user?.email,
        emp.designation,
        emp.isActive ? 'Active' : 'Inactive',
        emp.assignments?.length || 0,
        emp.exitDate ? new Date(emp.exitDate).toLocaleDateString('en-IN') : '—'
      ], eWidths, y, i % 2 === 0)
      y += 18
    })

    doc.fontSize(8).fillColor('#94A3B8')
       .text('Confidential — AssetIQ Complete System Report', 40, 555, { align: 'center' })

    doc.end()
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {
  getAssetReport,
  getEmployeeReport,
  getDamageReport,
  getFullReport
}