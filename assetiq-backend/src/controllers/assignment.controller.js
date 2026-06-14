const prisma           = require('../utils/prisma')
const assignmentRepo   = require('../repositories/assignment.repository')
const auditService     = require('../services/audit.service')
const pdfService       = require('../services/pdf.service')
const { success, error } = require('../utils/response')

// GET all assignments
const getAllAssignments = async (req, res) => {
  try {
    const assignments = await assignmentRepo.findAll()
    return success(res, assignments, 'Assignments fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

// POST assign asset to employee
const assignAsset = async (req, res) => {
  try {
    const { employeeId, assetId, notes } = req.body

    // Check employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true }
    })
    if (!employee) return error(res, 'Employee not found', 404)
    if (!employee.isActive) return error(res, 'Employee is not active', 400)

    // Check asset exists and available
    const asset = await prisma.asset.findUnique({ where: { id: assetId } })
    if (!asset) return error(res, 'Asset not found', 404)
    if (asset.status !== 'AVAILABLE')
      return error(res, `Asset is not available. Current status: ${asset.status}`, 400)

    // Check asset not already assigned
    const existingAssignment = await assignmentRepo.findByAsset(assetId)
    if (existingAssignment)
      return error(res, 'Asset is already assigned to someone', 400)

    // Create assignment + update asset status — transaction
    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.create({
        data: {
          employeeId,
          assetId,
          notes: notes || null,
          isActive: true
        },
        include: {
          employee: {
            include: { user: { select: { name: true, email: true } } }
          },
          asset: true
        }
      })

      await tx.asset.update({
        where: { id: assetId },
        data: { status: 'ASSIGNED' }
      })

      return assignment
    })

    // Generate handover receipt PDF
    const { fileName } = await pdfService.generateHandoverReceipt(result)
    await prisma.assignment.update({
      where: { id: result.id },
      data: { receiptUrl: `/uploads/certificates/${fileName}` }
    })

    // Audit log
    await auditService.log({
      userId:   req.user.id,
      action:   'ASSIGN',
      entity:   'Assignment',
      entityId: result.id,
      newValue: { employeeId, assetId }
    })

    return success(res, {
      ...result,
      receiptUrl: `/uploads/certificates/${fileName}`
    }, 'Asset assigned successfully', 201)
  } catch (err) {
    return error(res, err.message)
  }
}

// POST return asset
const returnAsset = async (req, res) => {
  try {
    const { assignmentId, condition, notes } = req.body

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        asset: true,
        employee: { include: { user: true } }
      }
    })

    if (!assignment)      return error(res, 'Assignment not found', 404)
    if (!assignment.isActive) return error(res, 'Assignment already closed', 400)

    // Close assignment + update asset — transaction
    await prisma.$transaction(async (tx) => {
      await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          isActive:     false,
          returnedDate: new Date(),
          notes:        notes || assignment.notes
        }
      })

      await tx.asset.update({
        where: { id: assignment.assetId },
        data: {
          status:    'AVAILABLE',
          condition: condition || 'GOOD'
        }
      })

      // Update return checklist if exists
      await tx.returnChecklist.updateMany({
        where: {
          employeeId: assignment.employeeId,
          assetId:    assignment.assetId,
          status:     'PENDING'
        },
        data: {
          status:    'RETURNED',
          checkedAt: new Date()
        }
      })
    })

    await auditService.log({
      userId:   req.user.id,
      action:   'RETURN',
      entity:   'Assignment',
      entityId: assignmentId,
      newValue: { condition, returnedDate: new Date() }
    })

    // Check if all assets returned — generate clearance
    const pendingItems = await prisma.returnChecklist.count({
      where: {
        employeeId: assignment.employeeId,
        status: 'PENDING'
      }
    })

    let clearanceUrl = null
    if (pendingItems === 0) {
      const employee = await prisma.employee.findUnique({
        where: { id: assignment.employeeId },
        include: { user: true }
      })
      if (employee?.exitDate) {
        const { fileName } = await pdfService.generateClearanceCertificate(employee)
        clearanceUrl = `/uploads/certificates/${fileName}`
        await prisma.employee.update({
          where: { id: assignment.employeeId },
          data: { isActive: false }
        })
      }
    }

    return success(res, {
      message: 'Asset returned successfully',
      clearanceGenerated: pendingItems === 0,
      clearanceUrl
    }, 'Return processed')
  } catch (err) {
    return error(res, err.message)
  }
}

// GET assignments of one employee
const getEmployeeAssignments = async (req, res) => {
  try {
    const assignments = await assignmentRepo.findActive(req.params.employeeId)
    return success(res, assignments, 'Employee assignments fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = {
  getAllAssignments,
  assignAsset,
  returnAsset,
  getEmployeeAssignments
}