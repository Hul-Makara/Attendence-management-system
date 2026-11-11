const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    name: { type: String, required: true },
    phone: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
