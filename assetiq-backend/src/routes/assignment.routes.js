const express = require('express')
const router  = express.Router()
const {
  getAllAssignments, assignAsset,
  returnAsset, getEmployeeAssignments
} = require('../controllers/assignment.controller')
const { assignValidator, returnValidator, validate } = require('../validators/assignment.validator')
const { authenticate } = require('../middleware/auth.middleware')
const { authorize }    = require('../middleware/role.middleware')

router.use(authenticate)

// GET all assignments
router.get('/', getAllAssignments)

// GET employee assignments
router.get('/employee/:employeeId', getEmployeeAssignments)

// POST assign asset
router.post('/assign',
  authorize('ADMIN', 'IT_MANAGER'),
  assignValidator, validate,
  assignAsset
)

// POST return asset
router.post('/return',
  authorize('ADMIN', 'IT_MANAGER'),
  returnValidator, validate,
  returnAsset
)

module.exports = router