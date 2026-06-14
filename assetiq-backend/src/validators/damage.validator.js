const { body, validationResult } = require('express-validator')

const createDamageValidator = [
  body('assetId')
    .notEmpty().withMessage('Asset ID is required'),
  body('description')
    .notEmpty().withMessage('Description is required')
    // trim() hatao — form-data mein issue karta hai
]

const reviewDamageValidator = [
  body('repairCost')
    .optional()
    .isFloat({ min: 0 }).withMessage('Valid repair cost required'),
  body('status')
    .isIn(['OPEN', 'UNDER_REVIEW', 'RESOLVED']).withMessage('Invalid status')
]

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      data: null
    })
  }
  next()
}

module.exports = { createDamageValidator, reviewDamageValidator, validate }