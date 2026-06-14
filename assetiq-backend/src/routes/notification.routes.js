const express          = require('express')
const router           = express.Router()
const { authenticate } = require('../middleware/auth.middleware')
const { authorize }    = require('../middleware/role.middleware')
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notification.controller')

router.use(authenticate)

router.get('/',          getNotifications)
router.put('/read-all',  markAllAsRead)
router.put('/:id/read',  markAsRead)
router.post('/',         authorize('ADMIN', 'IT_MANAGER'), require('../controllers/notification.controller').createNotification)
router.get('/test-email', authorize('ADMIN'),              require('../controllers/notification.controller').testEmail)

module.exports = router