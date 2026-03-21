const router = require('express').Router();
const {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
} = require('../controllers/billing.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('admin', 'billing'));

router.get('/',        getAllInvoices);
router.get('/:id',     getInvoiceById);
router.post('/',       createInvoice);
router.patch('/:id',   updateInvoiceStatus);

module.exports = router;
