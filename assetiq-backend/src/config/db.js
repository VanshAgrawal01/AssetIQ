const prisma = require('../utils/prisma')
const logger = require('../utils/logger')

const connectDB = async () => {
  try {
    await prisma.$connect()
    logger.info('Database connected successfully')
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}`)
    process.exit(1)
  }
}

module.exports = connectDB