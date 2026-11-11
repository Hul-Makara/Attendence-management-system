const { Router } = require('express');
const controller = require('../controllers/leaveRequest.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = Router();

router.get('/summary/:studentId', authMiddleware, controller.getStudentLeaveSummary);
router.get('/', authMiddleware, controller.getLeaveRequests);
router.post('/', authMiddleware, upload.array('evidence'), controller.createLeaveRequest);
router.put('/:id/review', authMiddleware, roleCheck('Teacher', 'Admin'), controller.reviewLeaveRequest);

module.exports = router;
