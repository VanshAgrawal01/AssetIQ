const express = require('express')
const router  = express.Router()
const {
  getAllDamageReports,
  getDamageReport,
  createDamageReport,
  reviewDamageReport
} = require('../controllers/damage.controller')
const { reviewDamageValidator, validate } = require('../validators/damage.validator')
const { authenticate } = require('../middleware/auth.middleware')
const { authorize }    = require('../middleware/role.middleware')
const upload           = require('../middleware/upload.middleware')

router.use(authenticate)

router.get('/', getAllDamageReports)
router.get('/:id', getDamageReport)

// Validator hatao POST se — controller mein check karenge
router.post('/', upload.single('photo'), createDamageReport)

router.put('/:id',
  authorize('ADMIN', 'IT_MANAGER'),
  reviewDamageValidator, validate,
  reviewDamageReport
)

module.exports = router