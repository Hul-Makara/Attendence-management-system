const mongoose = require('mongoose');

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const sessionSchema = new mongoose.Schema(
  {
    days: [{ type: String, enum: WEEKDAYS }],
    startTime: { type: String }, // "HH:mm"
    endTime: { type: String },   // "HH:mm"
    room: { type: String },
  },
  { _id: false }
);

const subjectSchema = new mongoose.Schema(
  {
    subjectName: { type: String, required: true },
    subjectCode: { type: String },
    description: { type: String },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    credit: { type: Number, min: 1, max: 10 },
    classGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup' }],
    sessions: [sessionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
