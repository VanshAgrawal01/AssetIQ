const prisma = require('../utils/prisma')

const calculateHealthScore = async (assetId) => {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      damageReports: true,
      ipLogs: { orderBy: { lastSeen: 'desc' }, take: 1 }
    }
  })

  if (!asset) return 100

  // Age in years
  const ageYears = (Date.now() - new Date(asset.purchaseDate)) / (1000 * 60 * 60 * 24 * 365)

  // Damage count
  const damageCount = asset.damageReports.length

  // Repair count
  const repairCount = asset.damageReports.filter(d => d.status === 'RESOLVED').length

  // Offline days
  let offlineDays = 0
  if (asset.ipLogs.length > 0) {
    const lastSeen = new Date(asset.ipLogs[0].lastSeen)
    offlineDays = Math.floor((Date.now() - lastSeen) / (1000 * 60 * 60 * 24))
  }

  // Formula
  let score = 100
  score -= Math.floor(ageYears * 10)
  score -= damageCount * 5
  score -= repairCount * 8
  score -= Math.min(offlineDays, 30) * 1

  const finalScore = Math.max(0, Math.min(100, score))

  // Update in DB
  await prisma.asset.update({
    where: { id: assetId },
    data: { healthScore: finalScore }
  })

  return finalScore
}

module.exports = { calculateHealthScore }