const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
    },
    classGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup' },
    studentname_en: { type: String, trim: true },
    studentname_kh: { type: String, trim: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'M', 'F'], default: 'other' },
    phone: { type: String, default: '' },
    photo: { type: String, default: '' },
    isBlacklisted: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Only enforce unique user when user is an actual ObjectId
studentSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } }
);

// Pre-save hook to ensure studentname_en and firstName/lastName stay in sync
studentSchema.pre('save', function (next) {
  if (this.studentname_en && (!this.firstName || !this.lastName)) {
    const parts = this.studentname_en.trim().split(' ');
    this.firstName = parts[0] || '';
    this.lastName = parts.slice(1).join(' ') || parts[0] || '';
  } else if (!this.studentname_en && (this.firstName || this.lastName)) {
    this.studentname_en = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);
