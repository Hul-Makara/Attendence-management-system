const { Router } = require('express');
const controller = require('../controllers/user.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const router = Router();

router.get('/', authMiddleware, roleCheck('Admin'), controller.getUsers);
router.post('/', controller.createUser);
router.get('/:id', authMiddleware, controller.getUserById);
router.put('/:id', authMiddleware, roleCheck('Admin'), controller.updateUser);
router.delete('/:id', authMiddleware, roleCheck('Admin'), controller.deleteUser);
router.patch('/:id/toggle-status', authMiddleware, roleCheck('Admin'), controller.toggleStatus);
router.patch('/:id/change-password', authMiddleware, controller.changePassword);
router.patch('/:id/profile', authMiddleware, controller.updateProfile);

module.exports = router;
