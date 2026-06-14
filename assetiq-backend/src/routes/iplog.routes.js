const express = require('express')
const router  = express.Router()
const prisma  = require('../utils/prisma')
const { authenticate } = require('../middleware/auth.middleware')
const { success, error } = require('../utils/response')

router.use(authenticate)

// POST — log IP
router.post('/', async (req, res) => {
  try {
    const { assetId, ipAddress, macAddress } = req.body
    if (!assetId || !ipAddress) return error(res, 'Asset ID and IP required', 400)

    // Check duplicate
    const existing = await prisma.ipLog.findFirst({
      where: { ipAddress, assetId: { not: assetId } }
    })

    const log = await prisma.ipLog.create({
      data: {
        assetId,
        ipAddress,
        macAddress: macAddress || null,
        isDuplicate: !!existing,
        lastSeen: new Date()
      }
    })

    return success(res, log, 'IP logged', 201)
  } catch (err) {
    return error(res, err.message)
  }
})

// GET — asset ke IP logs
router.get('/:assetId', async (req, res) => {
  try {
    const logs = await prisma.ipLog.findMany({
      where: { assetId: req.params.assetId },
      orderBy: { lastSeen: 'desc' },
      take: 20
    })
    return success(res, logs, 'IP logs fetched')
  } catch (err) {
    return error(res, err.message)
  }
})

module.exports = router