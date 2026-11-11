const { Router } = require('express');
const controller = require('../controllers/teacher.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const router = Router();

router.get('/', authMiddleware, controller.getTeachers);
router.get('/:id', authMiddleware, controller.getTeacherById);
router.get('/:id/subjects', authMiddleware, controller.getTeacherSubjects);
router.post('/', authMiddleware, roleCheck('Admin'), controller.createTeacher);
router.put('/:id', authMiddleware, controller.updateTeacher);
router.delete('/:id', authMiddleware, roleCheck('Admin'), controller.deleteTeacher);

module.exports = router;
