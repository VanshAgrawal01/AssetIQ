const express = require('express')
const router = express.Router()
const { register, login, getMe } = require('../controllers/auth.controller')
const { registerValidator, loginValidator, validate } = require('../validators/auth.validator')
const { authenticate } = require('../middleware/auth.middleware')


// POST /api/auth/register
router.post('/register', registerValidator, validate, register)

// POST /api/auth/login
router.post('/login', loginValidator, validate, login)

// GET /api/auth/me  (protected)
router.get('/me', authenticate, getMe)

module.exports = router