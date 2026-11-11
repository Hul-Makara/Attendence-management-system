const { Router } = require('express');
const controller = require('../controllers/subject.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const router = Router();

router.get('/schedule', authMiddleware, controller.getSchedule);
router.get('/teacher/:teacherId', authMiddleware, controller.getSubjectsByTeacher);
router.get('/', authMiddleware, controller.getSubjects);
router.get('/:id', authMiddleware, controller.getSubjectById);
router.post('/', authMiddleware, roleCheck('Admin', 'Teacher'), controller.createSubject);
router.put('/:id', authMiddleware, roleCheck('Admin', 'Teacher'), controller.updateSubject);
router.delete('/:id', authMiddleware, roleCheck('Admin'), controller.deleteSubject);

module.exports = router;
