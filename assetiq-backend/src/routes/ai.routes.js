const express    = require('express')
const router     = express.Router()
const { askAI }  = require('../controllers/ai.controller')
const { authenticate } = require('../middleware/auth.middleware')

router.use(authenticate)

router.post('/ask', askAI)

module.exports = router