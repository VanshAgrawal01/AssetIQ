const prisma        = require('../utils/prisma')
const assetRepo     = require('../repositories/asset.repository')
const auditService  = require('../services/audit.service')
const qrService     = require('../services/qr.service')
const healthService = require('../services/health.service')
const { success, error } = require('../utils/response')

// GET all
const getAllAssets = async (req, res) => {
  try {
    const { status, type, supplierId, search } = req.query
    const assets = await assetRepo.findAll({ status, type, supplierId, search })
    return success(res, assets, 'Assets fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

// GET one
const getAsset = async (req, res) => {
  try {
    const asset = await assetRepo.findById(req.params.id)
    if (!asset) return error(res, 'Asset not found', 404)
    return success(res, asset, 'Asset fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

// GET by asset code (QR scan — public)
const getAssetByCode = async (req, res) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { assetCode: req.params.code },
      include: {
        supplier: { select: { name: true } },
        assignments: {
          where: { isActive: true },
          include: { employee: { include: { user: { select: { name: true, email: true } } } } }
        },
        damageReports: { orderBy: { createdAt: 'desc' }, take: 5 }
      }
    })
    if (!asset) return error(res, 'Asset not found', 404)
    return success(res, asset, 'Asset fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

// POST create
const createAsset = async (req, res) => {
  try {
    const {
      name, type, brand, model,
      serialNumber, purchaseDate,
      warrantyExpiry, supplierId
    } = req.body

    // Check serial number
    const existing = await assetRepo.findBySerial(serialNumber)
    if (existing) return error(res, 'Serial number already exists', 400)

    // Generate asset code
    const count    = await prisma.asset.count()
    const assetCode = `AST${String(count + 1).padStart(4, '0')}`

    // Generate QR
    const qrCode = await qrService.generateQR(assetCode)

    const asset = await assetRepo.create({
      name, type, brand, model,
      serialNumber,
      assetCode,
      qrCode,
      purchaseDate:   new Date(purchaseDate),
      warrantyExpiry: new Date(warrantyExpiry),
      ...(supplierId && { supplierId })
    })

    await auditService.log({
      userId:   req.user.id,
      action:   'CREATE',
      entity:   'Asset',
      entityId: asset.id,
      newValue: { name, type, brand, serialNumber, assetCode }
    })

    return success(res, asset, 'Asset created successfully', 201)
  } catch (err) {
    return error(res, err.message)
  }
}

// PUT update
const updateAsset = async (req, res) => {
  try {
    const asset = await assetRepo.findById(req.params.id)
    if (!asset) return error(res, 'Asset not found', 404)

    const { condition, status, warrantyExpiry, supplierId } = req.body

    const updated = await assetRepo.update(req.params.id, {
      ...(condition      && { condition }),
      ...(status         && { status }),
      ...(warrantyExpiry && { warrantyExpiry: new Date(warrantyExpiry) }),
      ...(supplierId     && { supplierId })
    })

    // Recalculate health score
    await healthService.calculateHealthScore(req.params.id)

    await auditService.log({
      userId:   req.user.id,
      action:   'UPDATE',
      entity:   'Asset',
      entityId: req.params.id,
      oldValue: { condition: asset.condition, status: asset.status },
      newValue: req.body
    })

    return success(res, updated, 'Asset updated')
  } catch (err) {
    return error(res, err.message)
  }
}

// GET dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [
      total, available, assigned,
      underRepair, unreturned,
      warrantyExpiringSoon, lowHealth
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: 'AVAILABLE'    } }),
      prisma.asset.count({ where: { status: 'ASSIGNED'     } }),
      prisma.asset.count({ where: { status: 'UNDER_REPAIR' } }),
      prisma.asset.count({ where: { status: 'UNRETURNED'   } }),
      prisma.asset.count({
        where: {
          warrantyExpiry: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.asset.count({ where: { healthScore: { lt: 40 } } })
    ])

    return success(res, {
      total, available, assigned,
      underRepair, unreturned,
      warrantyExpiringSoon, lowHealth
    }, 'Dashboard stats fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = {
  getAllAssets, getAsset,
  getAssetByCode, createAsset,
  updateAsset, getDashboardStats
}