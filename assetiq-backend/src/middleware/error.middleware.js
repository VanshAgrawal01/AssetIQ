const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} — ${req.method} ${req.url}`)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    data: null
  })
}

module.exports = { errorHandler }
