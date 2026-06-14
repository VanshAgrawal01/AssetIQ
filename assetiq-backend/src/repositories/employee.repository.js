const prisma = require('../utils/prisma')

const findAll = (filters = {}) => {
  const where = {}
  if (filters.isActive !== undefined) where.isActive = filters.isActive
  if (filters.department) where.department = { contains: filters.department, mode: 'insensitive' }
  if (filters.search) {
    where.OR = [
      { user: { name: { contains: filters.search, mode: 'insensitive' } } },
      { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      { employeeCode: { contains: filters.search, mode: 'insensitive' } }
    ]
  }
  return prisma.employee.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      assignments: {
        where: { isActive: true },
        include: { asset: { select: { id: true, name: true, type: true, assetCode: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

const findById = (id) => {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      assignments: {
        include: { asset: true }
      },
      damageReports: {
        include: { asset: { select: { name: true, assetCode: true } } }
      },
      assetRequests: true
    }
  })
}

const findByUserId = (userId) => {
  return prisma.employee.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, email: true, role: true } }
    }
  })
}

const create = (data) => {
  return prisma.employee.create({
    data,
    include: {
      user: { select: { id: true, name: true, email: true, role: true } }
    }
  })
}

const update = (id, data) => {
  return prisma.employee.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, name: true, email: true, role: true } }
    }
  })
}

const remove = (id) => {
  return prisma.employee.update({
    where: { id },
    data: { isActive: false }
  })
}

module.exports = { findAll, findById, findByUserId, create, update, remove }