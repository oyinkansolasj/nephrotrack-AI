const router = require('express').Router();
const {
  runPrediction,
  getPredictionsByPatient,
} = require('../controllers/predictions.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/',                        authorize('clinician', 'admin'), runPrediction);
router.get('/patient/:patientId',       getPredictionsByPatient);

module.exports = router;
