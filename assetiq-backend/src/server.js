require('dotenv').config()
const app    = require('./app')
const connectDB = require('./config/db')
const logger = require('./utils/logger')

const { startAlertEngine }    = require('./jobs/alertEngine.job')
const { startHealthScoreJob } = require('./jobs/healthScore.job')
const { startExitReminderJob } = require('./jobs/exitReminder.job')

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()

  startAlertEngine()
  startHealthScoreJob()
  startExitReminderJob()

  app.listen(PORT, () => {
    logger.info(`AssetIQ server running on port ${PORT}`)
  })
}

startServer()