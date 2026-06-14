const transporter = require('../config/email')
const logger      = require('../utils/logger')

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"AssetIQ" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    })
    logger.info(`Email sent to ${to}: ${subject}`)
    return true
  } catch (err) {
    logger.error(`Email failed: ${err.message}`)
    return false
  }
}

module.exports = { sendEmail }