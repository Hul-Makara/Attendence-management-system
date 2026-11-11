const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true, unique: true, trim: true },
    roleDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
