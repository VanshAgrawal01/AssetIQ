const cron          = require('node-cron')
const prisma        = require('../utils/prisma')
const healthService = require('../services/health.service')
const logger        = require('../utils/logger')

const startHealthScoreJob = () => {
  // Roz raat 12 baje
  cron.schedule('0 0 * * *', async () => {
    logger.info('Health Score Job running...')
    await updateAllHealthScores()
  })
  logger.info('Health Score Job scheduled')
}

const updateAllHealthScores = async () => {
  try {
    const assets = await prisma.asset.findMany({
      where: { status: { not: 'WRITTEN_OFF' } },
      select: { id: true, assetCode: true }
    })

    for (const asset of assets) {
      await healthService.calculateHealthScore(asset.id)
      logger.info(`Health score updated for ${asset.assetCode}`)
    }

    logger.info(`Health scores updated for ${assets.length} assets`)
  } catch (err) {
    logger.error(`Health score job failed: ${err.message}`)
  }
}

module.exports = { startHealthScoreJob }