const bcrypt = require('bcrypt')
const prisma = require('../utils/prisma')
const employeeRepo = require('../repositories/employee.repository')
const auditService = require('../services/audit.service')
const { success, error } = require('../utils/response')

// GET all employees
const getAllEmployees = async (req, res) => {
  try {
    const { search, department, isActive } = req.query
    const filters = {
      search,
      department,
      isActive: isActive === 'false' ? false : isActive === 'true' ? true : undefined
    }
    const employees = await employeeRepo.findAll(filters)
    return success(res, employees, 'Employees fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

// GET single employee
const getEmployee = async (req, res) => {
  try {
    const employee = await employeeRepo.findById(req.params.id)
    if (!employee) return error(res, 'Employee not found', 404)
    return success(res, employee, 'Employee fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

// POST create employee
const createEmployee = async (req, res) => {
  try {
    const {
      name, email, password, role,
      employeeCode, department, designation,
      phone, joinDate
    } = req.body

    // Check email exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return error(res, 'Email already registered', 400)

    // Check employee code exists
    const existingCode = await prisma.employee.findUnique({ where: { employeeCode } })
    if (existingCode) return error(res, 'Employee code already exists', 400)

    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'Welcome@123', 10)

    // Create user + employee in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'EMPLOYEE'
        }
      })

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeCode,
          department,
          designation,
          phone,
          joinDate: new Date(joinDate)
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } }
        }
      })

      return employee
    })

    // Auto create asset request
    await prisma.assetRequest.create({
      data: {
        employeeId: result.id,
        assetType: 'LAPTOP',
        status: 'PENDING'
      }
    })

    // Audit log
    await auditService.log({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'Employee',
      entityId: result.id,
      newValue: { name, email, employeeCode, department }
    })

    return success(res, result, 'Employee created successfully', 201)
  } catch (err) {
    return error(res, err.message)
  }
}

// PUT update employee
const updateEmployee = async (req, res) => {
  try {
    const employee = await employeeRepo.findById(req.params.id)
    if (!employee) return error(res, 'Employee not found', 404)

    const { department, designation, phone, exitDate } = req.body

    const updated = await employeeRepo.update(req.params.id, {
      ...(department && { department }),
      ...(designation && { designation }),
      ...(phone && { phone }),
      ...(exitDate && { exitDate: new Date(exitDate) })
    })

    // If exit date set — auto generate return checklist
    if (exitDate) {
      const activeAssignments = await prisma.assignment.findMany({
        where: { employeeId: req.params.id, isActive: true }
      })

      for (const assignment of activeAssignments) {
        await prisma.returnChecklist.upsert({
          where: {
            id: `${req.params.id}_${assignment.assetId}`
          },
          update: {},
          create: {
            employeeId: req.params.id,
            assetId: assignment.assetId,
            status: 'PENDING'
          }
        }).catch(() => {
          prisma.returnChecklist.create({
            data: {
              employeeId: req.params.id,
              assetId: assignment.assetId,
              status: 'PENDING'
            }
          })
        })
      }
    }

    await auditService.log({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'Employee',
      entityId: req.params.id,
      oldValue: { department: employee.department },
      newValue: req.body
    })

    return success(res, updated, 'Employee updated')
  } catch (err) {
    return error(res, err.message)
  }
}

// DELETE (soft delete)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await employeeRepo.findById(req.params.id)
    if (!employee) return error(res, 'Employee not found', 404)

    await employeeRepo.remove(req.params.id)

    await auditService.log({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'Employee',
      entityId: req.params.id
    })

    return success(res, null, 'Employee deactivated')
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
}