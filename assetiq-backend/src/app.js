const express = require('express')
const cors    = require('cors')
const { errorHandler }  = require('./middleware/error.middleware')
const { requestLogger } = require('./middleware/logger.middleware')

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)
app.use('/uploads', express.static('uploads'))

app.get('/ping', (req, res) => res.json({ message: 'AssetIQ backend running' }))

app.use('/api/auth',          require('./routes/auth.routes'))
app.use('/api/employees',     require('./routes/employee.routes'))
app.use('/api/assets',        require('./routes/asset.routes'))
app.use('/api/suppliers',     require('./routes/supplier.routes'))
app.use('/api/assignments',   require('./routes/assignment.routes'))
app.use('/api/damage',        require('./routes/damage.routes'))
app.use('/api/audit',         require('./routes/audit.routes'))
app.use('/api/notifications', require('./routes/notification.routes'))
app.use('/api/ai',            require('./routes/ai.routes'))
app.use('/api/ip-logs', require('./routes/iplog.routes'))
app.use('/api/asset-requests', require('./routes/assetrequest.routes'))
app.use('/api/reports', require('./routes/report.routes'))

app.use(errorHandler)

module.exports = app