const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { 
    type: String, 
    enum: ['sick', 'personal', 'emergency', 'academic', 'vacation', 'maternity', 'paternity', 'other'],
    required: true 
  },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  totalDays: { type: Number },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  reviewRemarks: { type: String },
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

LeaveSchema.pre('save', function(next) {
  if (this.fromDate && this.toDate) {
    const diff = Math.ceil((this.toDate - this.fromDate) / (1000 * 60 * 60 * 24)) + 1;
    this.totalDays = diff;
  }
  next();
});

module.exports = mongoose.model('Leave', LeaveSchema);
