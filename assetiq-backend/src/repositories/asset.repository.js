const prisma = require('../utils/prisma')

const findAll = (filters = {}) => {
  const where = {}
  if (filters.status)     where.status    = filters.status
  if (filters.type)       where.type      = filters.type
  if (filters.supplierId) where.supplierId = filters.supplierId
  if (filters.search) {
    where.OR = [
      { name:         { contains: filters.search, mode: 'insensitive' } },
      { serialNumber: { contains: filters.search, mode: 'insensitive' } },
      { assetCode:    { contains: filters.search, mode: 'insensitive' } },
      { brand:        { contains: filters.search, mode: 'insensitive' } },
    ]
  }
  return prisma.asset.findMany({
    where,
    include: {
      supplier: { select: { id: true, name: true } },
      assignments: {
        where: { isActive: true },
        include: { employee: { include: { user: { select: { name: true, email: true } } } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

const findById = (id) => {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      supplier: true,
      assignments: {
        include: { employee: { include: { user: { select: { name: true, email: true } } } } },
        orderBy: { createdAt: 'desc' }
      },
      damageReports: { orderBy: { createdAt: 'desc' } },
      ipLogs:        { orderBy: { lastSeen: 'desc'  }, take: 10 }
    }
  })
}

const findBySerial = (serialNumber) =>
  prisma.asset.findUnique({ where: { serialNumber } })

const create = (data) =>
  prisma.asset.create({ data, include: { supplier: true } })

const update = (id, data) =>
  prisma.asset.update({ where: { id }, data, include: { supplier: true } })

module.exports = { findAll, findById, findBySerial, create, update }