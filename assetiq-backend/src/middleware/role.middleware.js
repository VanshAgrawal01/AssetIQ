const { error } = require('../utils/response')

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(res, 'Access denied — insufficient permissions', 403)
    }
    next()
  }
}

module.exports = { authorize }