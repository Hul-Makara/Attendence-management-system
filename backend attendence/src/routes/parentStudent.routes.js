const { Router } = require('express');
const controller = require('../controllers/parentStudent.controller');
const { authMiddleware } = require('../middleware/auth');
const router = Router();

router.get('/', authMiddleware, controller.getAll);
router.get('/:id', authMiddleware, controller.getById);
router.post('/', authMiddleware, controller.create);
router.delete('/:id', authMiddleware, controller.remove);

module.exports = router;
