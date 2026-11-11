const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    parentName: { type: String, required: true },
    phone: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Parent', parentSchema);
