const express = require('express')
const router = express.Router()
const {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employee.controller')
const { createEmployeeValidator, updateEmployeeValidator, validate } = require('../validators/employee.validator')
const { authenticate } = require('../middleware/auth.middleware')
const { authorize } = require('../middleware/role.middleware')

// All routes protected
router.use(authenticate)

// GET /api/employees
router.get('/', getAllEmployees)

// GET /api/employees/:id
router.get('/:id', getEmployee)

// POST /api/employees  — Admin only
router.post('/', authorize('ADMIN'), createEmployeeValidator, validate, createEmployee)

// PUT /api/employees/:id  — Admin, IT_MANAGER
router.put('/:id', authorize('ADMIN', 'IT_MANAGER'), updateEmployeeValidator, validate, updateEmployee)

// DELETE /api/employees/:id  — Admin only
router.delete('/:id', authorize('ADMIN'), deleteEmployee)

module.exports = router