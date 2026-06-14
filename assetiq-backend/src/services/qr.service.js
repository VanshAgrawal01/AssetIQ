const QRCode = require('qrcode')

const generateQR = async (assetId) => {
  const url = `${process.env.CLIENT_URL}/scan/${assetId}`
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' }
  })
  return qrDataUrl
}

module.exports = { generateQR }