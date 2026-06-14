const { body, validationResult } = require('express-validator')

const createAssetValidator = [
  body('name').trim().notEmpty().withMessage('Asset name is required'),
  body('type').isIn(['LAPTOP','MONITOR','KEYBOARD','MOUSE','HEADSET','PHONE','TABLET','OTHER']).withMessage('Invalid asset type'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('serialNumber').trim().notEmpty().withMessage('Serial number is required'),
  body('purchaseDate').isISO8601().withMessage('Valid purchase date required'),
  body('warrantyExpiry').isISO8601().withMessage('Valid warranty expiry required'),
]

const updateAssetValidator = [
  body('condition').optional().isIn(['GOOD','DAMAGED','UNDER_REPAIR','WRITTEN_OFF']),
  body('status').optional().isIn(['AVAILABLE','ASSIGNED','UNDER_REPAIR','WRITTEN_OFF','UNRETURNED']),
]

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, data: null })
  }
  next()
}

module.exports = { createAssetValidator, updateAssetValidator, validate }