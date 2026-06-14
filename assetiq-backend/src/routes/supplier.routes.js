const express = require('express')
const router  = express.Router()
const {
  getAllSuppliers, getSupplier,
  createSupplier, updateSupplier,
  deleteSupplier
} = require('../controllers/supplier.controller')
const { authenticate } = require('../middleware/auth.middleware')
const { authorize }    = require('../middleware/role.middleware')

router.use(authenticate)

router.get('/',    getAllSuppliers)
router.get('/:id', getSupplier)
router.post('/',   authorize('ADMIN'), createSupplier)
router.put('/:id', authorize('ADMIN'), updateSupplier)
router.delete('/:id', authorize('ADMIN'), deleteSupplier)

module.exports = router