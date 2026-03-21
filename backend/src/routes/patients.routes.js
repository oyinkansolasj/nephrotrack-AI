const router = require('express').Router();
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
} = require('../controllers/patients.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/',      getAllPatients);
router.get('/:id',   getPatientById);
router.post('/',     authorize('admin', 'records_officer'), createPatient);
router.put('/:id',   authorize('admin', 'records_officer'), updatePatient);

module.exports = router;
