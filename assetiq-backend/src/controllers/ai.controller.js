const prisma  = require('../utils/prisma')
const { callClaude } = require('../config/ai')
const { success, error } = require('../utils/response')

const askAI = async (req, res) => {
  try {
    const { question } = req.body
    if (!question) return error(res, 'Question is required', 400)

    // Fetch relevant data from DB
    const [assets, employees, damageReports, assignments] = await Promise.all([
      prisma.asset.findMany({
        select: {
          assetCode: true, name: true, type: true,
          status: true, condition: true, healthScore: true,
          warrantyExpiry: true, serialNumber: true
        }
      }),
      prisma.employee.findMany({
        where: { isActive: true },
        select: {
          employeeCode: true, department: true,
          designation: true, exitDate: true,
          user: { select: { name: true, email: true } },
          assignments: {
            where: { isActive: true },
            select: { asset: { select: { name: true, assetCode: true } } }
          }
        }
      }),
      prisma.damageReport.findMany({
        where: { status: { not: 'RESOLVED' } },
        select: {
          status: true, description: true, repairCost: true,
          asset:    { select: { name: true, assetCode: true } },
          employee: { include: { user: { select: { name: true } } } }
        }
      }),
      prisma.assignment.findMany({
        where: { isActive: true },
        select: {
          assignedDate: true,
          asset:    { select: { name: true, assetCode: true } },
          employee: { include: { user: { select: { name: true } } } }
        }
      })
    ])

    // Unreturned assets
    const unreturned = await prisma.returnChecklist.findMany({
      where: { status: 'MISSING' },
      include: {
        asset:    { select: { name: true, assetCode: true } },
        employee: { include: { user: { select: { name: true } } } }
      }
    })

    // Build context
    const context = `
You are AssetIQ AI Assistant. You have access to the following live data:

ASSETS (${assets.length} total):
${JSON.stringify(assets, null, 2)}

ACTIVE EMPLOYEES (${employees.length} total):
${JSON.stringify(employees, null, 2)}

OPEN DAMAGE REPORTS (${damageReports.length} total):
${JSON.stringify(damageReports, null, 2)}

ACTIVE ASSIGNMENTS (${assignments.length} total):
${JSON.stringify(assignments, null, 2)}

UNRETURNED/MISSING ASSETS (${unreturned.length} total):
${JSON.stringify(unreturned, null, 2)}

Answer the user's question based on this data. Be specific, clear, and concise.
If data is not available, say so honestly.
`

    const answer = await callClaude(context, question)

    return success(res, { question, answer }, 'AI response generated')
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = { askAI }
