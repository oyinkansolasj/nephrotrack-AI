const router = require('express').Router();
const { login, logout, me } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/login',  login);
router.post('/logout', protect, logout);
router.get('/me',      protect, me);

module.exports = router;
