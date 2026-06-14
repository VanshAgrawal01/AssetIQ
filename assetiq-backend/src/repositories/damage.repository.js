const prisma = require('../utils/prisma')

const findAll = (filters = {}) => {
  const where = {}
  if (filters.status)     where.status     = filters.status
  if (filters.assetId)    where.assetId    = filters.assetId
  if (filters.employeeId) where.employeeId = filters.employeeId

  return prisma.damageReport.findMany({
    where,
    include: {
      asset: {
        select: { id: true, name: true, assetCode: true, type: true }
      },
      employee: {
        include: { user: { select: { name: true, email: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

const findById = (id) =>
  prisma.damageReport.findUnique({
    where: { id },
    include: {
      asset: true,
      employee: { include: { user: { select: { name: true, email: true } } } }
    }
  })

const create = (data) =>
  prisma.damageReport.create({
    data,
    include: {
      asset: { select: { name: true, assetCode: true } },
      employee: { include: { user: { select: { name: true } } } }
    }
  })

const update = (id, data) =>
  prisma.damageReport.update({ where: { id }, data })

module.exports = { findAll, findById, create, update }
