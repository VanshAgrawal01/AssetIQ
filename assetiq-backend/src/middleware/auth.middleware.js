const { verifyToken } = require('../utils/jwt')
const { error } = require('../utils/response')

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'No token provided', 401)
    }
    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (err) {
    return error(res, 'Invalid or expired token', 401)
  }
}

module.exports = { authenticate }