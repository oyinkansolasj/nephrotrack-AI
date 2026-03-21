const router = require('express').Router();
const {
  getAllVisits,
  getVisitsByPatient,
  createVisit,
} = require('../controllers/visits.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/',                   getAllVisits);
router.get('/patient/:patientId', getVisitsByPatient);
router.post('/',                  authorize('clinician', 'admin'), createVisit);

module.exports = router;
