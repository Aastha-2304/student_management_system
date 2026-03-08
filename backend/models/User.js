const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
  rollNumber: { type: String }, // for students
  employeeId: { type: String }, // for faculty
  department: { type: String, required: true },
  semester: { type: Number }, // for students
  phone: { type: String },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // students
  teachingCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // faculty
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwt = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

module.exports = mongoose.model('User', UserSchema);
