const { Router } = require('express');
const controller = require('../controllers/classGroup.controller');
const router = Router();

router.get('/', controller.getClassGroups);
router.get('/:id', controller.getClassGroupById);
router.post('/', controller.createClassGroup);
router.put('/:id', controller.updateClassGroup);
router.delete('/:id', controller.deleteClassGroup);

module.exports = router;
