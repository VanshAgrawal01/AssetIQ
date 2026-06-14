const prisma = require('../utils/prisma')

const findActive = (employeeId) =>
  prisma.assignment.findMany({
    where: { employeeId, isActive: true },
    include: { asset: true }
  })

const findByAsset = (assetId) =>
  prisma.assignment.findFirst({
    where: { assetId, isActive: true },
    include: {
      employee: { include: { user: { select: { name: true, email: true } } } }
    }
  })

const findAll = () =>
  prisma.assignment.findMany({
    include: {
      employee: { include: { user: { select: { name: true, email: true } } } },
      asset: { select: { id: true, name: true, assetCode: true, type: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

const create = (data) =>
  prisma.assignment.create({
    data,
    include: {
      employee: { include: { user: { select: { name: true, email: true } } } },
      asset: true
    }
  })

const update = (id, data) =>
  prisma.assignment.update({ where: { id }, data })

module.exports = { findActive, findByAsset, findAll, create, update }