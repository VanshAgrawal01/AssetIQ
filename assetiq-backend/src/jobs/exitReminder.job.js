const cron   = require('node-cron')
const prisma = require('../utils/prisma')
const { sendEmail } = require('../services/email.service')
const logger = require('../utils/logger')

const startExitReminderJob = () => {
  // Roz subah 8 baje
  cron.schedule('0 8 * * *', async () => {
    logger.info('Exit Reminder Job running...')
    await checkPendingExits()
  })
  logger.info('Exit Reminder Job scheduled')
}

const checkPendingExits = async () => {
  try {
    const threeDaysLater = new Date()
    threeDaysLater.setDate(threeDaysLater.getDate() + 3)

    // Employees jinki exit 3 din mein hai
    const employees = await prisma.employee.findMany({
      where: {
        exitDate:  { lte: threeDaysLater },
        isActive:  true
      },
      include: {
        user: true,
        assignments: {
          where: { isActive: true },
          include: { asset: { select: { name: true, assetCode: true } } }
        }
      }
    })

    for (const emp of employees) {
      if (emp.assignments.length === 0) continue

      const exitDate = new Date(emp.exitDate).toDateString()
      const assetList = emp.assignments
        .map(a => `<li>${a.asset.name} — ${a.asset.assetCode}</li>`)
        .join('')

      await sendEmail({
        to:      process.env.EMAIL_USER,
        subject: `🚨 Exit Alert — ${emp.user.name} exits on ${exitDate}`,
        html: `
          <h2>Exit Reminder</h2>
          <p><b>${emp.user.name}</b> (${emp.employeeCode}) is exiting on <b>${exitDate}</b>.</p>
          <p>The following assets have NOT been returned yet:</p>
          <ul>${assetList}</ul>
          <p>Please initiate the return process immediately.</p>
        `
      })
      logger.info(`Exit reminder sent for ${emp.employeeCode}`)
    }
  } catch (err) {
    logger.error(`Exit reminder failed: ${err.message}`)
  }
}

module.exports = { startExitReminderJob }