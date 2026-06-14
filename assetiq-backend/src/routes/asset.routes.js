const express = require('express')
const router  = express.Router()
const {
  getAllAssets, getAsset, getAssetByCode,
  createAsset, updateAsset, getDashboardStats
} = require('../controllers/asset.controller')
const { createAssetValidator, updateAssetValidator, validate } = require('../validators/asset.validator')
const { authenticate } = require('../middleware/auth.middleware')
const { authorize }    = require('../middleware/role.middleware')

// Public route — QR scan (no login)
router.get('/scan/:code', getAssetByCode)

// Dashboard stats
router.get('/stats/dashboard', authenticate, getDashboardStats)

// Protected routes
router.use(authenticate)

router.get('/',    getAllAssets)
router.get('/:id', getAsset)

router.post('/',
  authorize('ADMIN', 'IT_MANAGER'),
  createAssetValidator, validate,
  createAsset
)

router.put('/:id',
  authorize('ADMIN', 'IT_MANAGER'),
  updateAssetValidator, validate,
  updateAsset
)

module.exports = router