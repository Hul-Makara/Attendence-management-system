const { Router } = require('express');
const controller = require('../controllers/role.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const router = Router();

router.get('/', controller.getRoles);
router.post('/', controller.createRole);
router.get('/:id', authMiddleware, controller.getRoleById);
router.get('/:id/users', authMiddleware, roleCheck('Admin'), controller.getUsersByRole);
router.put('/:id', authMiddleware, roleCheck('Admin'), controller.updateRole);
router.delete('/:id', authMiddleware, roleCheck('Admin'), controller.deleteRole);

module.exports = router;
