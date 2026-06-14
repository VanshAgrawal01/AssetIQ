const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const QRCode = require('qrcode')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Hash password
  const pass = await bcrypt.hash('admin123', 10)

  // Create IT Manager
  const itUser = await prisma.user.upsert({
    where: { email: 'it@assetiq.com' },
    update: {},
    create: { name: 'IT Manager', email: 'it@assetiq.com', password: pass, role: 'IT_MANAGER' }
  })

  // Create 5 more employees
  const empData = [
    { name: 'Priya Patel',   email: 'priya@assetiq.com',  code: 'EMP002', dept: 'Design',   desig: 'UI Designer'      },
    { name: 'Amit Shah',     email: 'amit@assetiq.com',   code: 'EMP003', dept: 'DevOps',   desig: 'DevOps Engineer'   },
    { name: 'Neha Gupta',    email: 'neha@assetiq.com',   code: 'EMP004', dept: 'HR',       desig: 'HR Manager'        },
    { name: 'Rohan Mehta',   email: 'rohan@assetiq.com',  code: 'EMP005', dept: 'Finance',  desig: 'Finance Analyst'   },
    { name: 'Vansh Agrawal', email: 'vansh@assetiq.com',  code: 'EMP006', dept: 'Engineering', desig: 'Full Stack Dev' },
  ]

  for (const emp of empData) {
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: { name: emp.name, email: emp.email, password: pass, role: 'EMPLOYEE' }
    })
    await prisma.employee.upsert({
      where: { employeeCode: emp.code },
      update: {},
      create: {
        userId: user.id, employeeCode: emp.code,
        department: emp.dept, designation: emp.desig,
        joinDate: new Date('2024-03-01')
      }
    })
  }

  // Create supplier
  const supplier = await prisma.supplier.upsert({
    where: { id: 'seed-supplier-hp' },
    update: {},
    create: {
      id: 'seed-supplier-hp',
      name: 'HP India Pvt Ltd',
      contactEmail: 'support@hp.com',
      contactPhone: '1800425646',
      slaDays: 5
    }
  }).catch(async () => {
    return await prisma.supplier.create({
      data: {
        name: 'HP India Pvt Ltd',
        contactEmail: 'support2@hp.com',
        contactPhone: '1800425646',
        slaDays: 5
      }
    })
  })

  // Create 5 more assets
  const assetData = [
    { name: 'HP EliteBook 840', type: 'LAPTOP',  brand: 'HP',     model: 'EliteBook 840', serial: 'HP840001', purchase: '2022-06-15', warranty: '2025-06-15' },
    { name: 'Dell Monitor 24"', type: 'MONITOR', brand: 'Dell',   model: 'P2422H',        serial: 'DM24001',  purchase: '2023-01-10', warranty: '2026-01-10' },
    { name: 'Logitech MX Keys', type: 'KEYBOARD',brand: 'Logitech',model: 'MX Keys',      serial: 'LMK001',   purchase: '2023-03-20', warranty: '2025-03-20' },
    { name: 'iPhone 13',        type: 'PHONE',   brand: 'Apple',  model: 'iPhone 13',     serial: 'IP13001',  purchase: '2022-11-01', warranty: '2024-11-01' },
    { name: 'MacBook Pro M2',   type: 'LAPTOP',  brand: 'Apple',  model: 'MacBook Pro',   serial: 'MBP001',   purchase: '2023-08-15', warranty: '2026-08-15' },
  ]

  let count = 2
  for (const a of assetData) {
    const assetCode = `AST${String(count).padStart(4,'0')}`
    const qrCode    = await QRCode.toDataURL(`http://localhost:3000/scan/${assetCode}`)

    await prisma.asset.upsert({
      where:  { serialNumber: a.serial },
      update: {},
      create: {
        name: a.name, type: a.type, brand: a.brand,
        model: a.model, serialNumber: a.serial,
        assetCode, qrCode,
        purchaseDate:   new Date(a.purchase),
        warrantyExpiry: new Date(a.warranty),
        supplierId: supplier.id
      }
    })
    count++
  }

  console.log('✅ Seed complete!')
  console.log('   5 employees added')
  console.log('   5 assets added')
  console.log('   1 supplier added')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())