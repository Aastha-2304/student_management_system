const mongoose = require('mongoose');

const AttendanceRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], default: 'absent' },
  remarks: { type: String, default: '' }
});

const AttendanceSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  session: { type: String, enum: ['morning', 'afternoon', 'evening'], default: 'morning' },
  topic: { type: String, default: '' },
  records: [AttendanceRecordSchema],
  createdAt: { type: Date, default: Date.now }
});

AttendanceSchema.index({ course: 1, date: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
