const { Router } = require('express');
const controller = require('../controllers/student.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = Router();

router.get('/blacklisted', authMiddleware, controller.getBlacklistedStudents);
router.get('/export', authMiddleware, controller.exportStudents);
router.get('/', authMiddleware, controller.getStudents);
router.get('/:id', authMiddleware, controller.getStudentById);
router.get('/:id/parents', authMiddleware, controller.getStudentParents);
router.post('/import', upload.single('file'), controller.importStudents);
router.post('/', controller.createStudent);
router.put('/restore/:id', controller.restoreStudent);
router.put('/:id', authMiddleware, controller.updateStudent);
router.delete('/:id', authMiddleware, roleCheck('Admin'), controller.deleteStudent);

module.exports = router;
