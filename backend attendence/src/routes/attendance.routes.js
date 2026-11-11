const { Router } = require('express');
const controller = require('../controllers/attendance.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const router = Router();

// GET routes — specific paths before :id
router.get('/today', authMiddleware, controller.getTodayAttendance);
router.get('/late-report', authMiddleware, roleCheck('Teacher', 'Admin'), controller.getLateReport);
router.get('/absent-report', authMiddleware, roleCheck('Teacher', 'Admin'), controller.getAbsentReport);
router.get('/check-leave-status', authMiddleware, controller.checkLeaveStatus);
router.get('/leave-request/:id', authMiddleware, controller.getLeaveRequestById);
router.get('/stats/:studentId', authMiddleware, controller.getStudentStats);
router.get('/', authMiddleware, controller.getAttendance);

// POST routes
router.post('/bulk', authMiddleware, roleCheck('Teacher', 'Admin'), controller.bulkMarkAttendance);
router.post('/mark-absent', authMiddleware, roleCheck('Teacher', 'Admin'), controller.markAbsent);
router.post('/', authMiddleware, roleCheck('Teacher', 'Admin'), controller.markAttendance);

// PUT / DELETE
router.put('/:id', authMiddleware, roleCheck('Teacher', 'Admin'), controller.updateAttendance);
router.delete('/:id', authMiddleware, roleCheck('Admin'), controller.deleteAttendance);

module.exports = router;
