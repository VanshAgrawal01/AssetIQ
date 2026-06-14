const prisma  = require('../utils/prisma')
const auditService = require('../services/audit.service')
const { success, error } = require('../utils/response')

// GET all suppliers
const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        assets: {
          select: {
            id: true, name: true,
            assetCode: true, type: true, status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return success(res, suppliers, 'Suppliers fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

// GET one supplier
const getSupplier = async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id },
      include: {
        assets: true
      }
    })
    if (!supplier) return error(res, 'Supplier not found', 404)
    return success(res, supplier, 'Supplier fetched')
  } catch (err) {
    return error(res, err.message)
  }
}

// POST create supplier
const createSupplier = async (req, res) => {
  try {
    const { name, contactEmail, contactPhone, address, contractDate, slaDays } = req.body

    if (!name)         return error(res, 'Name is required', 400)
    if (!contactEmail) return error(res, 'Contact email is required', 400)

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactEmail,
        contactPhone: contactPhone || null,
        address:      address      || null,
        contractDate: contractDate ? new Date(contractDate) : null,
        slaDays:      slaDays      || 7
      }
    })

    await auditService.log({
      userId:   req.user.id,
      action:   'CREATE',
      entity:   'Supplier',
      entityId: supplier.id,
      newValue: { name, contactEmail }
    })

    return success(res, supplier, 'Supplier created', 201)
  } catch (err) {
    return error(res, err.message)
  }
}

// PUT update supplier
const updateSupplier = async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id }
    })
    if (!supplier) return error(res, 'Supplier not found', 404)

    const { name, contactEmail, contactPhone, address, slaDays } = req.body

    const updated = await prisma.supplier.update({
      where: { id: req.params.id },
      data: {
        ...(name         && { name }),
        ...(contactEmail && { contactEmail }),
        ...(contactPhone && { contactPhone }),
        ...(address      && { address }),
        ...(slaDays      && { slaDays: parseInt(slaDays) })
      }
    })

    await auditService.log({
      userId:   req.user.id,
      action:   'UPDATE',
      entity:   'Supplier',
      entityId: req.params.id,
      newValue: req.body
    })

    return success(res, updated, 'Supplier updated')
  } catch (err) {
    return error(res, err.message)
  }
}

// DELETE supplier
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id }
    })
    if (!supplier) return error(res, 'Supplier not found', 404)

    await prisma.supplier.delete({ where: { id: req.params.id } })

    await auditService.log({
      userId:   req.user.id,
      action:   'DELETE',
      entity:   'Supplier',
      entityId: req.params.id
    })

    return success(res, null, 'Supplier deleted')
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = {
  getAllSuppliers, getSupplier,
  createSupplier, updateSupplier,
  deleteSupplier
}