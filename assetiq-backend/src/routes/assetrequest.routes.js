const express = require('express')
const router  = express.Router()
const prisma  = require('../utils/prisma')
const { authenticate } = require('../middleware/auth.middleware')
const { authorize }    = require('../middleware/role.middleware')
const auditService     = require('../services/audit.service')
const pdfService       = require('../services/pdf.service')
const { success, error } = require('../utils/response')

router.use(authenticate)

// GET all requests
router.get('/', async (req, res) => {
  try {
    const requests = await prisma.assetRequest.findMany({
      include: {
        employee: {
          include: { user: { select: { name: true, email: true } } }
        },
        asset: { select: { name: true, assetCode: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return success(res, requests, 'Requests fetched')
  } catch (err) {
    return error(res, err.message)
  }
})

// PUT approve
router.put('/:id/approve',
  authorize('ADMIN', 'IT_MANAGER'),
  async (req, res) => {
    try {
      const { assetId } = req.body
      if (!assetId) return error(res, 'Asset ID required', 400)

      const request = await prisma.assetRequest.findUnique({
        where: { id: req.params.id },
        include: {
          employee: { include: { user: true } }
        }
      })
      if (!request) return error(res, 'Request not found', 404)

      const asset = await prisma.asset.findUnique({ where: { id: assetId } })
      if (!asset) return error(res, 'Asset not found', 404)
      if (asset.status !== 'AVAILABLE') return error(res, 'Asset not available', 400)

      // Transaction — approve request + create assignment
      const result = await prisma.$transaction(async (tx) => {
        await tx.assetRequest.update({
          where: { id: req.params.id },
          data: { status: 'APPROVED', assetId }
        })

        const assignment = await tx.assignment.create({
          data: {
            employeeId: request.employeeId,
            assetId,
            isActive: true
          },
          include: {
            employee: { include: { user: true } },
            asset: true
          }
        })

        await tx.asset.update({
          where: { id: assetId },
          data: { status: 'ASSIGNED' }
        })

        return assignment
      })

      // Generate PDF receipt
      try {
        const { fileName } = await pdfService.generateHandoverReceipt(result)
        await prisma.assignment.update({
          where: { id: result.id },
          data: { receiptUrl: `/uploads/certificates/${fileName}` }
        })
      } catch (pdfErr) {
        console.error('PDF error:', pdfErr.message)
      }

      await auditService.log({
        userId:   req.user.id,
        action:   'APPROVE',
        entity:   'AssetRequest',
        entityId: req.params.id,
        newValue: { assetId, employeeId: request.employeeId }
      })

      return success(res, result, 'Request approved and asset assigned')
    } catch (err) {
      return error(res, err.message)
    }
  }
)

// PUT reject
router.put('/:id/reject',
  authorize('ADMIN', 'IT_MANAGER'),
  async (req, res) => {
    try {
      const { reason } = req.body

      const updated = await prisma.assetRequest.update({
        where: { id: req.params.id },
        data: {
          status: 'REJECTED',
          rejectedNote: reason || 'No reason provided'
        }
      })

      await auditService.log({
        userId:   req.user.id,
        action:   'REJECT',
        entity:   'AssetRequest',
        entityId: req.params.id,
        newValue: { reason }
      })

      return success(res, updated, 'Request rejected')
    } catch (err) {
      return error(res, err.message)
    }
  }
)

module.exports = router