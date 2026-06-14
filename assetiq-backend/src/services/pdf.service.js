const PDFDocument = require('pdfkit')
const fs          = require('fs')
const path        = require('path')

const generateHandoverReceipt = (assignment) => {
  return new Promise((resolve, reject) => {
    const doc      = new PDFDocument({ margin: 50 })
    const fileName = `handover_${assignment.id}_${Date.now()}.pdf`
    const filePath = path.join('uploads', 'certificates', fileName)

    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)

    // Header
    doc.fontSize(22).font('Helvetica-Bold').text('AssetIQ', { align: 'center' })
    doc.fontSize(14).font('Helvetica').text('Asset Handover Receipt', { align: 'center' })
    doc.moveDown()
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown()

    // Employee details
    doc.fontSize(12).font('Helvetica-Bold').text('Employee Details')
    doc.font('Helvetica')
    doc.text(`Name       : ${assignment.employee.user.name}`)
    doc.text(`Email      : ${assignment.employee.user.email}`)
    doc.text(`Department : ${assignment.employee.department}`)
    doc.text(`Emp Code   : ${assignment.employee.employeeCode}`)
    doc.moveDown()

    // Asset details
    doc.font('Helvetica-Bold').text('Asset Details')
    doc.font('Helvetica')
    doc.text(`Asset Name  : ${assignment.asset.name}`)
    doc.text(`Asset Code  : ${assignment.asset.assetCode}`)
    doc.text(`Type        : ${assignment.asset.type}`)
    doc.text(`Brand       : ${assignment.asset.brand}`)
    doc.text(`Model       : ${assignment.asset.model}`)
    doc.text(`Serial No.  : ${assignment.asset.serialNumber}`)
    doc.text(`Warranty    : ${new Date(assignment.asset.warrantyExpiry).toDateString()}`)
    doc.moveDown()

    // Assignment details
    doc.font('Helvetica-Bold').text('Assignment Details')
    doc.font('Helvetica')
    doc.text(`Assigned On : ${new Date(assignment.assignedDate).toDateString()}`)
    doc.moveDown(2)

    // Signature
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown()
    doc.text('Employee Signature: ____________________', { continued: true })
    doc.text('    Date: ____________________')
    doc.moveDown()
    doc.text('IT Manager Signature: ____________________', { continued: true })
    doc.text('    Date: ____________________')
    doc.moveDown(2)

    doc.fontSize(10).fillColor('gray')
      .text('This is a system-generated document by AssetIQ.', { align: 'center' })

    doc.end()

    stream.on('finish', () => resolve({ fileName, filePath }))
    stream.on('error',  reject)
  })
}

const generateClearanceCertificate = (employee) => {
  return new Promise((resolve, reject) => {
    const doc      = new PDFDocument({ margin: 50 })
    const fileName = `clearance_${employee.id}_${Date.now()}.pdf`
    const filePath = path.join('uploads', 'certificates', fileName)

    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)

    // Header
    doc.fontSize(22).font('Helvetica-Bold').text('AssetIQ', { align: 'center' })
    doc.fontSize(16).font('Helvetica').text('Clearance Certificate', { align: 'center' })
    doc.moveDown()
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown()

    doc.fontSize(12).text(`This is to certify that ${employee.user.name} (${employee.employeeCode})`)
    doc.text(`from ${employee.department} department has successfully returned`)
    doc.text('all assigned IT assets as on the date below.')
    doc.moveDown(2)

    doc.font('Helvetica-Bold').text(`Exit Date : ${new Date(employee.exitDate).toDateString()}`)
    doc.font('Helvetica').text(`Issued On : ${new Date().toDateString()}`)
    doc.moveDown(3)

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown()
    doc.text('IT Manager Signature: ____________________')
    doc.moveDown(2)

    doc.fontSize(10).fillColor('gray')
      .text('System generated — AssetIQ', { align: 'center' })

    doc.end()

    stream.on('finish', () => resolve({ fileName, filePath }))
    stream.on('error',  reject)
  })
}

module.exports = { generateHandoverReceipt, generateClearanceCertificate }