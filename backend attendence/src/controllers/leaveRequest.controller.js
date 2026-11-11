const moment = require('moment');
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');

// GET /api/leave-requests
exports.getLeaveRequests = async (req, res) => {
  try {
    const { studentId, status } = req.query;
    const filter = {};
    if (studentId) filter.student = studentId;
    if (status) filter.status = status;

    const leaves = await LeaveRequest.find(filter)
      .populate({
        path: 'student',
        select: 'firstName lastName classGroup',
        populate: { path: 'classGroup', select: 'groupName' },
      })
      .populate('reviewedBy', 'username')
      .sort({ requestedAt: -1 });

    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leave-requests/summary/:studentId
exports.getStudentLeaveSummary = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ student: req.params.studentId });
    const total = leaves.length;
    const pending = leaves.filter((l) => l.status === 'pending').length;
    const approved = leaves.filter((l) => l.status === 'approved').length;
    const rejected = leaves.filter((l) => l.status === 'rejected').length;

    res.json({ success: true, data: { total, pending, approved, rejected } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave-requests (multipart with evidence files)
exports.createLeaveRequest = async (req, res) => {
  try {
    const { student, fromDate, toDate, reason } = req.body;
    if (!student || !fromDate || !toDate || !reason) {
      return res.status(400).json({ success: false, message: 'student, fromDate, toDate, and reason are required' });
    }

    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        attachments.push(file.path);
      }
    }

    const leave = await LeaveRequest.create({
      student,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason,
      attachments,
    });

    res.status(201).json({ success: true, message: 'Leave request submitted', data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/leave-requests/:id/review
exports.reviewLeaveRequest = async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be "approved" or "rejected"' });
    }

    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

    leave.status = status;
    leave.reviewedBy = req.user.userId;
    leave.reviewedAt = new Date();
    if (note) leave.note = note;
    await leave.save();

    // If approved, auto-mark attendance as on-leave for the date range
    if (status === 'approved') {
      const start = moment(leave.fromDate).startOf('day');
      const end = moment(leave.toDate).startOf('day');
      const current = start.clone();

      while (current.isSameOrBefore(end)) {
        await Attendance.findOneAndUpdate(
          { student: leave.student, date: current.toDate(), subject: null },
          {
            student: leave.student,
            date: current.toDate(),
            status: 'on-leave',
            leaveReference: leave._id,
          },
          { upsert: true }
        );
        current.add(1, 'day');
      }
    }

    const populated = await LeaveRequest.findById(leave._id)
      .populate('student', 'firstName lastName')
      .populate('reviewedBy', 'username');

    res.json({
      success: true,
      message: `Leave request ${status}`,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
