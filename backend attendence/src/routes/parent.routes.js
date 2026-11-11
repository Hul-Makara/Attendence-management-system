const { Router } = require('express');
const controller = require('../controllers/parent.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const router = Router();

router.get('/', authMiddleware, controller.getParents);
router.get('/:id', authMiddleware, controller.getParentById);
router.get('/:id/children', authMiddleware, controller.getParentChildren);
router.post('/', authMiddleware, roleCheck('Admin'), controller.createParent);
router.post('/:id/children', authMiddleware, roleCheck('Admin'), controller.addChild);
router.put('/:id', authMiddleware, controller.updateParent);
router.delete('/:id', authMiddleware, roleCheck('Admin'), controller.deleteParent);
router.delete('/:id/children/:studentId', authMiddleware, roleCheck('Admin'), controller.removeChild);

module.exports = router;
