const cron   = require('node-cron')
const prisma = require('../utils/prisma')
const { sendEmail } = require('../services/email.service')
const logger = require('../utils/logger')

const startAlertEngine = () => {
  // Roz subah 9 baje
  cron.schedule('0 9 * * *', async () => {
    logger.info('Alert Engine running...')
    await checkWarrantyExpiry()
    await checkOfflineDevices()
  })
  logger.info('Alert Engine scheduled')
}

// Warranty 30 din mein expire hone wale
const checkWarrantyExpiry = async () => {
  try {
    const thirtyDaysLater = new Date()
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

    const assets = await prisma.asset.findMany({
      where: {
        warrantyExpiry: { lte: thirtyDaysLater },
        status: { not: 'WRITTEN_OFF' }
      },
      include: {
        assignments: {
          where: { isActive: true },
          include: { employee: { include: { user: true } } }
        }
      }
    })

    for (const asset of assets) {
      const expiryDate = new Date(asset.warrantyExpiry).toDateString()
      await sendEmail({
        to:      process.env.EMAIL_USER,
        subject: `⚠️ Warranty Expiring Soon — ${asset.name}`,
        html: `
          <h2>Warranty Alert</h2>
          <p>Asset <b>${asset.name}</b> (${asset.assetCode}) warranty expires on <b>${expiryDate}</b>.</p>
          <p>Serial: ${asset.serialNumber}</p>
          <p>Please renew or replace the device.</p>
        `
      })
      logger.info(`Warranty alert sent for ${asset.assetCode}`)
    }
  } catch (err) {
    logger.error(`Warranty check failed: ${err.message}`)
  }
}

// Device 7 din se offline
const checkOfflineDevices = async () => {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const offlineAssets = await prisma.asset.findMany({
      where: {
        status: 'ASSIGNED',
        ipLogs: {
          none: { lastSeen: { gte: sevenDaysAgo } }
        }
      }
    })

    if (offlineAssets.length > 0) {
      await sendEmail({
        to:      process.env.EMAIL_USER,
        subject: `🔴 ${offlineAssets.length} Device(s) Offline for 7+ Days`,
        html: `
          <h2>Offline Device Alert</h2>
          <p>The following devices have not been seen on network for 7+ days:</p>
          <ul>
            ${offlineAssets.map(a => `<li>${a.name} — ${a.assetCode}</li>`).join('')}
          </ul>
          <p>Please investigate immediately.</p>
        `
      })
      logger.info(`Offline alert sent for ${offlineAssets.length} devices`)
    }
  } catch (err) {
    logger.error(`Offline check failed: ${err.message}`)
  }
}

module.exports = { startAlertEngine }