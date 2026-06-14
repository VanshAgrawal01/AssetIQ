const { body, validationResult } = require('express-validator')

const createEmployeeValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
  body('employeeCode').trim().notEmpty().withMessage('Employee code is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
  body('joinDate').isISO8601().withMessage('Valid join date required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone required')
]

const updateEmployeeValidator = [
  body('department').optional().trim().notEmpty(),
  body('designation').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone(),
  body('exitDate').optional().isISO8601().withMessage('Valid exit date required')
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

module.exports = { createEmployeeValidator, updateEmployeeValidator, validate }