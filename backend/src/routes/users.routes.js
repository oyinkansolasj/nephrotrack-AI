const router = require('express').Router();
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/users.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/',      getAllUsers);
router.post('/',     createUser);
router.put('/:id',   updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
