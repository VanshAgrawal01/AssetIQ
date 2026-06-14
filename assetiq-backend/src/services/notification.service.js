const notificationRepo = require('../repositories/notification.repository')
const { sendEmail }    = require('./email.service')
const logger           = require('../utils/logger')

const createNotification = async ({ title, message, type, targetRole }) => {
  try {
    const notification = await notificationRepo.create({
      title,
      message,
      type,
      targetRole: targetRole || null
    })
    return notification
  } catch (err) {
    logger.error(`Notification creation failed: ${err.message}`)
  }
}

const notifyAndEmail = async ({ title, message, type, targetRole, emailTo }) => {
  await createNotification({ title, message, type, targetRole })

  if (emailTo) {
    await sendEmail({
      to:      emailTo,
      subject: title,
      html:    `<h2>${title}</h2><p>${message}</p>`
    })
  }
}

module.exports = { createNotification, notifyAndEmail }