const prisma = require('../utils/prisma')

const log = async ({ userId, action, entity, entityId, oldValue, newValue }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        oldValue: oldValue || undefined,
        newValue: newValue || undefined
      }
    })
  } catch (err) {
    console.error('Audit log failed:', err.message)
  }
}

module.exports = { log }