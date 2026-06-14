const prisma  = require('../utils/prisma')
const { success, error } = require('../utils/response')

const getAuditLogs = async (req, res) => {
  try {
    const { entity, userId, limit = 50 } = req.query

    const where = {}
    if (entity) where.entity = entity
    if (userId) where.userId = userId

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take:    parseInt(limit)
    })

    return success(res, logs, 'Audit logs fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

const getEntityLogs = async (req, res) => {
  try {
    const { entityId } = req.params

    const logs = await prisma.auditLog.findMany({
      where: { entityId },
      include: {
        user: { select: { name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return success(res, logs, 'Entity logs fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = { getAuditLogs, getEntityLogs }