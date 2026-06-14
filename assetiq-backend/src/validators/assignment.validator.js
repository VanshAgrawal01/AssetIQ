const { body, validationResult } = require('express-validator')

const assignValidator = [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('assetId').notEmpty().withMessage('Asset ID is required')
]

const returnValidator = [
  body('assignmentId').notEmpty().withMessage('Assignment ID is required'),
  body('condition').optional().isIn(['GOOD','DAMAGED','UNDER_REPAIR','WRITTEN_OFF'])
]

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, data: null })
  }
  next()
}

module.exports = { assignValidator, returnValidator, validate }