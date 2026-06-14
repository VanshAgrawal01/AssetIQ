const prisma           = require('../utils/prisma')
const damageRepo       = require('../repositories/damage.repository')
const auditService     = require('../services/audit.service')
const healthService    = require('../services/health.service')
const cloudinary       = require('../config/cloudinary')
const { success, error } = require('../utils/response')
const fs               = require('fs')

// GET all damage reports
const getAllDamageReports = async (req, res) => {
  try {
    const { status, assetId, employeeId } = req.query
    const reports = await damageRepo.findAll({ status, assetId, employeeId })
    return success(res, reports, 'Damage reports fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

// GET one
const getDamageReport = async (req, res) => {
  try {
    const report = await damageRepo.findById(req.params.id)
    if (!report) return error(res, 'Damage report not found', 404)
    return success(res, report, 'Damage report fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

// POST create — employee submits
const createDamageReport = async (req, res) => {
  try {
    // Multer ke baad body aata hai — dono se try karo
    const body = req.body || {}
    
    console.log('Body:', body)
    console.log('File:', req.file)

    const assetId     = (body.assetId     || '').trim()
    const description = (body.description || '').trim()

    if (!assetId)     return error(res, 'Asset ID is required', 400)
    if (!description) return error(res, 'Description is required', 400)

    const employee = await prisma.employee.findUnique({
      where: { userId: req.user.id }
    })
    if (!employee) return error(res, 'Employee record not found', 404)

    const asset = await prisma.asset.findUnique({ where: { id: assetId } })
    if (!asset) return error(res, 'Asset not found', 404)

    let photoUrl = null
    if (req.file) {
      photoUrl = `/uploads/damage-images/${req.file.filename}`
    }

    const report = await prisma.damageReport.create({
      data: {
        assetId,
        employeeId: employee.id,
        description,
        photoUrl,
        status: 'OPEN'
      },
      include: {
        asset:    { select: { name: true, assetCode: true } },
        employee: { include: { user: { select: { name: true } } } }
      }
    })

    await prisma.asset.update({
      where: { id: assetId },
      data:  { condition: 'DAMAGED' }
    })

    await auditService.log({
      userId:   req.user.id,
      action:   'CREATE',
      entity:   'DamageReport',
      entityId: report.id,
      newValue: { assetId, description }
    })

    return success(res, report, 'Damage report submitted', 201)
  } catch (err) {
    console.error('Damage error:', err)
    return error(res, err.message)
  }
}

// PUT review — IT Manager updates
const reviewDamageReport = async (req, res) => {
  try {
    const { repairCost, status, notes } = req.body

    const report = await damageRepo.findById(req.params.id)
    if (!report) return error(res, 'Damage report not found', 404)

    const updateData = {
      status,
      ...(repairCost !== undefined && { repairCost: parseFloat(repairCost) }),
      ...(status === 'RESOLVED'    && { resolvedAt: new Date() })
    }

    // Update asset status based on damage status
    let assetCondition = 'DAMAGED'
    let assetStatus    = report.asset.status

    if (status === 'RESOLVED') {
      assetCondition = 'GOOD'
    } else if (status === 'UNDER_REVIEW') {
      assetCondition = 'UNDER_REPAIR'
      assetStatus    = 'UNDER_REPAIR'
    }

    await prisma.$transaction(async (tx) => {
      await tx.damageReport.update({
        where: { id: req.params.id },
        data:  updateData
      })

      await tx.asset.update({
        where: { id: report.assetId },
        data: {
          condition: assetCondition,
          status:    assetStatus
        }
      })
    })

    // Recalculate health score
    await healthService.calculateHealthScore(report.assetId)

    await auditService.log({
      userId:   req.user.id,
      action:   'REVIEW',
      entity:   'DamageReport',
      entityId: req.params.id,
      newValue: { status, repairCost }
    })

    const updated = await damageRepo.findById(req.params.id)
    return success(res, updated, 'Damage report updated')
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = {
  getAllDamageReports,
  getDamageReport,
  createDamageReport,
  reviewDamageReport
}
