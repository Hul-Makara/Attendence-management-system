const mongoose = require('mongoose');

const classGroupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClassGroup', classGroupSchema);
