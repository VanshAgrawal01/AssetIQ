const bcrypt = require('bcrypt')
const prisma = require('../utils/prisma')
const { generateToken } = require('../utils/jwt')
const { success, error } = require('../utils/response')

// Register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return error(res, 'Email already registered', 400)

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'EMPLOYEE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    return success(res, { user, token }, 'User registered successfully', 201)
  } catch (err) {
    return error(res, err.message)
  }
}

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return error(res, 'Invalid email or password', 401)

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return error(res, 'Invalid email or password', 401)

    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    return success(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }, 'Login successful')
  } catch (err) {
    return error(res, err.message)
  }
}

// Get current user (me)
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            department: true,
            designation: true
          }
        }
      }
    })
    if (!user) return error(res, 'User not found', 404)
    return success(res, user, 'User fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = { register, login, getMe }