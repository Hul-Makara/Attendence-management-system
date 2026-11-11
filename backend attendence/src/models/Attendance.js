const mongoose = require('mongoose');

const ATTENDANCE_STATUS = ['present', 'absent', 'late', 'half-day', 'on-leave', 'excused'];

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    date: { type: Date, required: true, index: true },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    status: { type: String, enum: ATTENDANCE_STATUS, default: 'present', required: true },
    isLate: { type: Boolean, default: false },
    lateBy: { type: Number, default: 0 }, // minutes
    workHours: { type: Number },
    markedByTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    note: { type: String, default: '' },
    leaveReference: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveRequest' },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
module.exports.ATTENDANCE_STATUS = ATTENDANCE_STATUS;
