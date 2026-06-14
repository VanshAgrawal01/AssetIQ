const prisma = require('../utils/prisma')

const findAll = (filters = {}) => {
  const where = {}
  if (filters.isRead    !== undefined) where.isRead    = filters.isRead
  if (filters.targetRole)              where.targetRole = filters.targetRole

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50
  })
}

const create = (data) =>
  prisma.notification.create({ data })

const markRead = (id) =>
  prisma.notification.update({
    where: { id },
    data:  { isRead: true }
  })

const markAllRead = (targetRole) =>
  prisma.notification.updateMany({
    where: { targetRole, isRead: false },
    data:  { isRead: true }
  })

module.exports = { findAll, create, markRead, markAllRead }