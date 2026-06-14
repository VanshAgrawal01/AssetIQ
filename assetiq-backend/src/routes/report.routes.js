const express        = require('express')
const router         = express.Router()
const { authenticate } = require('../middleware/auth.middleware')
const { authorize }    = require('../middleware/role.middleware')
const {
  getAssetReport,
  getEmployeeReport,
  getDamageReport,
  getFullReport
} = require('../controllers/report.controller')

router.use(authenticate)
router.use(authorize('ADMIN', 'IT_MANAGER'))

router.get('/assets',    getAssetReport)
router.get('/employees', getEmployeeReport)
router.get('/damage',    getDamageReport)
router.get('/full',      getFullReport)

module.exports = router