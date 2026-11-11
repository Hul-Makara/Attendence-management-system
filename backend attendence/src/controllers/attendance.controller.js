const moment = require('moment');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const LeaveRequest = require('../models/LeaveRequest');

// GET /api/attendance — filterable list
exports.getAttendance = async (req, res) => {
  try {
    const { studentId, subjectId, date, startDate, endDate, status, classGroup } = req.query;
    const filter = {};

    if (studentId) filter.student = studentId;
    if (subjectId) filter.subject = subjectId;
    if (status) filter.status = status;

    if (date) {
      const d = moment(date).startOf('day');
      filter.date = { $gte: d.toDate(), $lte: moment(date).endOf('day').toDate() };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = moment(startDate).startOf('day').toDate();
      if (endDate) filter.date.$lte = moment(endDate).endOf('day').toDate();
    }

    // classGroup filter: find students in that group first
    if (classGroup) {
      const students = await Student.find({ classGroup, isDeleted: { $ne: true } }).select('_id');
      filter.student = { $in: students.map((s) => s._id) };
    }

    const records = await Attendance.find(filter)
      .populate({
        path: 'student',
        select: 'firstName lastName classGroup',
        populate: { path: 'classGroup', select: 'groupName' },
      })
      .populate('subject', 'subjectName subjectCode')
      .populate('markedByTeacher', 'name')
      .populate('leaveReference')
      .sort({ date: -1 });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/today
exports.getTodayAttendance = async (req, res) => {
  try {
    const start = moment().startOf('day').toDate();
    const end = moment().endOf('day').toDate();

    const records = await Attendance.find({ date: { $gte: start, $lte: end } })
      .populate({
        path: 'student',
        select: 'firstName lastName classGroup',
        populate: { path: 'classGroup', select: 'groupName' },
      })
      .populate('subject', 'subjectName')
      .populate('markedByTeacher', 'name');

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/stats/:studentId
exports.getStudentStats = async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId });
    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const halfDay = records.filter((r) => r.status === 'half-day').length;
    const onLeave = records.filter((r) => r.status === 'on-leave').length;
    const excused = records.filter((r) => r.status === 'excused').length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 100;

    res.json({
      success: true,
      data: { total, present, absent, late, halfDay, onLeave, excused, attendanceRate },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/late-report
exports.getLateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { $or: [{ isLate: true }, { status: 'late' }] };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = moment(startDate).startOf('day').toDate();
      if (endDate) filter.date.$lte = moment(endDate).endOf('day').toDate();
    }

    const records = await Attendance.find(filter)
      .populate({ path: 'student', select: 'firstName lastName classGroup', populate: { path: 'classGroup', select: 'groupName' } })
      .populate('subject', 'subjectName')
      .sort({ date: -1 });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/absent-report
exports.getAbsentReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { status: 'absent' };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = moment(startDate).startOf('day').toDate();
      if (endDate) filter.date.$lte = moment(endDate).endOf('day').toDate();
    }

    const records = await Attendance.find(filter)
      .populate({ path: 'student', select: 'firstName lastName classGroup', populate: { path: 'classGroup', select: 'groupName' } })
      .populate('subject', 'subjectName')
      .sort({ date: -1 });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/check-leave-status
exports.checkLeaveStatus = async (req, res) => {
  try {
    const { studentId, date } = req.query;
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId is required' });

    const checkDate = date ? new Date(date) : new Date();
    const leave = await LeaveRequest.findOne({
      student: studentId,
      status: 'approved',
      fromDate: { $lte: checkDate },
      toDate: { $gte: checkDate },
    }).populate('student', 'firstName lastName');

    res.json({ success: true, data: { onLeave: !!leave, leaveRequest: leave } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/leave-request/:id
exports.getLeaveRequestById = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id)
      .populate({ path: 'student', select: 'firstName lastName classGroup', populate: { path: 'classGroup', select: 'groupName' } })
      .populate('reviewedBy', 'username');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
    res.json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/attendance — mark single
exports.markAttendance = async (req, res) => {
  try {
    const { student, subject, date, checkInTime, checkOutTime, status, note } = req.body;
    if (!student || !date) {
      return res.status(400).json({ success: false, message: 'student and date are required' });
    }

    const attendanceDate = moment(date).startOf('day').toDate();
    let isLate = false;
    let lateBy = 0;
    let workHours = null;

    // Calculate late status
    if (checkInTime && subject) {
      const subjectDoc = await Subject.findById(subject);
      if (subjectDoc && subjectDoc.sessions && subjectDoc.sessions.length > 0) {
        const session = subjectDoc.sessions[0];
        if (session.startTime) {
          const scheduled = moment(date + ' ' + session.startTime, 'YYYY-MM-DD HH:mm');
          const actual = moment(checkInTime);
          if (actual.isAfter(scheduled)) {
            isLate = true;
            lateBy = actual.diff(scheduled, 'minutes');
          }
        }
      }
    }

    // Calculate work hours
    if (checkInTime && checkOutTime) {
      workHours = moment(checkOutTime).diff(moment(checkInTime), 'hours', true);
      workHours = Math.round(workHours * 100) / 100;
    }

    // Check for approved leave
    let leaveReference = null;
    if (status === 'on-leave') {
      const leave = await LeaveRequest.findOne({
        student,
        status: 'approved',
        fromDate: { $lte: attendanceDate },
        toDate: { $gte: attendanceDate },
      });
      if (leave) leaveReference = leave._id;
    }

    // Find teacher profile for markedByTeacher
    let markedByTeacher = null;
    if (req.user) {
      const teacher = await Teacher.findOne({ user: req.user.userId });
      if (teacher) markedByTeacher = teacher._id;
    }

    const filter = { student, date: attendanceDate, subject: subject || null };
    const updateDoc = {
      student,
      subject: subject || null,
      date: attendanceDate,
      checkInTime: checkInTime ? new Date(checkInTime) : undefined,
      checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined,
      status: status || 'present',
      isLate,
      lateBy,
      workHours,
      markedByTeacher,
      note: note || '',
      leaveReference,
    };

    const record = await Attendance.findOneAndUpdate(filter, updateDoc, {
      new: true,
      upsert: true,
      runValidators: true,
    })
      .populate('student', 'firstName lastName')
      .populate('subject', 'subjectName')
      .populate('markedByTeacher', 'name');

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/attendance/bulk
exports.bulkMarkAttendance = async (req, res) => {
  try {
    const { subjectId, date, records } = req.body;
    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'date and records are required' });
    }

    const attendanceDate = moment(date).startOf('day').toDate();
    let markedByTeacher = null;
    if (req.user) {
      const teacher = await Teacher.findOne({ user: req.user.userId });
      if (teacher) markedByTeacher = teacher._id;
    }

    let count = 0;
    for (const item of records) {
      const filter = { student: item.student, date: attendanceDate, subject: subjectId || null };
      await Attendance.findOneAndUpdate(
        filter,
        {
          ...filter,
          status: item.status || 'present',
          isLate: item.status === 'late',
          lateBy: item.lateBy || 0,
          markedByTeacher,
          note: item.note || '',
        },
        { upsert: true, runValidators: true }
      );
      count++;
    }

    res.json({ success: true, message: 'Bulk attendance marked', data: { marked: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/attendance/mark-absent
exports.markAbsent = async (req, res) => {
  try {
    const { student, subject, date } = req.body;
    if (!student || !date) {
      return res.status(400).json({ success: false, message: 'student and date are required' });
    }

    const attendanceDate = moment(date).startOf('day').toDate();
    let markedByTeacher = null;
    if (req.user) {
      const teacher = await Teacher.findOne({ user: req.user.userId });
      if (teacher) markedByTeacher = teacher._id;
    }

    const filter = { student, date: attendanceDate, subject: subject || null };
    const record = await Attendance.findOneAndUpdate(
      filter,
      { ...filter, status: 'absent', markedByTeacher },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/attendance/:id
exports.updateAttendance = async (req, res) => {
  try {
    const { status, note, checkInTime, checkOutTime } = req.body;
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Attendance record not found' });

    if (status) record.status = status;
    if (note !== undefined) record.note = note;
    if (checkInTime) record.checkInTime = new Date(checkInTime);
    if (checkOutTime) record.checkOutTime = new Date(checkOutTime);

    // Recalculate
    if (record.checkInTime && record.checkOutTime) {
      record.workHours = Math.round(moment(record.checkOutTime).diff(moment(record.checkInTime), 'hours', true) * 100) / 100;
    }

    if (record.checkInTime && record.subject) {
      const subjectDoc = await Subject.findById(record.subject);
      if (subjectDoc && subjectDoc.sessions && subjectDoc.sessions.length > 0) {
        const session = subjectDoc.sessions[0];
        if (session.startTime) {
          const dateStr = moment(record.date).format('YYYY-MM-DD');
          const scheduled = moment(dateStr + ' ' + session.startTime, 'YYYY-MM-DD HH:mm');
          const actual = moment(record.checkInTime);
          record.isLate = actual.isAfter(scheduled);
          record.lateBy = record.isLate ? actual.diff(scheduled, 'minutes') : 0;
        }
      }
    }

    await record.save();
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/attendance/:id
exports.deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Attendance record not found' });
    res.json({ success: true, message: 'Attendance record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
