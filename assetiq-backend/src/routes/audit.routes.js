const express = require('express')
const router  = express.Router()
const { getAuditLogs, getEntityLogs } = require('../controllers/audit.controller')
const { authenticate } = require('../middleware/auth.middleware')
const { authorize }    = require('../middleware/role.middleware')

router.use(authenticate)

router.get('/',              authorize('ADMIN', 'IT_MANAGER'), getAuditLogs)
router.get('/entity/:entityId', authorize('ADMIN', 'IT_MANAGER'), getEntityLogs)

module.exports = router