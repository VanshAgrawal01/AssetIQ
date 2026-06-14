const notificationRepo   = require('../repositories/notification.repository')
const { sendEmail }      = require('../services/email.service')
const { success, error } = require('../utils/response')

// GET all
const getNotifications = async (req, res) => {
  try {
    const { isRead } = req.query
    const filters = {
      targetRole: req.user.role,
      ...(isRead !== undefined && { isRead: isRead === 'true' })
    }
    const notifications = await notificationRepo.findAll(filters)
    return success(res, notifications, 'Notifications fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

// PUT mark one read
const markAsRead = async (req, res) => {
  try {
    await notificationRepo.markRead(req.params.id)
    return success(res, null, 'Notification marked as read')
  } catch (err) {
    return error(res, err.message)
  }
}

// PUT mark all read
const markAllAsRead = async (req, res) => {
  try {
    await notificationRepo.markAllRead(req.user.role)
    return success(res, null, 'All notifications marked as read')
  } catch (err) {
    return error(res, err.message)
  }
}

// POST create notification
const createNotification = async (req, res) => {
  try {
    const { title, message, type, targetRole, sendMail } = req.body

    if (!title || !message) return error(res, 'Title and message required', 400)

    const notification = await notificationRepo.create({
      title,
      message,
      type:       type       || 'INFO',
      targetRole: targetRole || null
    })

    // Email bhi bhejo agar sendMail: true
    if (sendMail) {
      await sendEmail({
        to:      process.env.EMAIL_USER,
        subject: title,
        html: `
          <h2>${title}</h2>
          <p>${message}</p>
          <p><small>${new Date().toLocaleString()}</small></p>
        `
      })
    }

    return success(res, notification, 'Notification created', 201)
  } catch (err) {
    return error(res, err.message)
  }
}

// GET test email
const testEmail = async (req, res) => {
  try {
    await sendEmail({
      to:      process.env.EMAIL_USER,
      subject: 'AssetIQ — Email Test ✅',
      html: `
        <h2>AssetIQ Email Working! ✅</h2>
        <p>Your email alerts are configured correctly.</p>
        <hr/>
        <p><b>Server:</b> AssetIQ Backend</p>
        <p><b>Time:</b> ${new Date().toLocaleString()}</p>
        <p><b>Status:</b> All systems operational</p>
      `
    })
    return success(res, null, 'Test email sent successfully!')
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  testEmail
}