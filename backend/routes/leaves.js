const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { protect, authorize } = require('../middleware/auth');

// GET leaves
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student' || req.user.role === 'faculty') {
      query.applicant = req.user._id;
    }
    const { status, fromDate, toDate, applicantId } = req.query;
    if (status) query.status = status;
    if (applicantId && req.user.role === 'admin') query.applicant = applicantId;
    if (fromDate || toDate) {
      query.fromDate = {};
      if (fromDate) query.fromDate.$gte = new Date(fromDate);
      if (toDate) query.fromDate.$lte = new Date(toDate);
    }
    
    const leaves = await Leave.find(query)
      .populate('applicant', 'name email role department rollNumber')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: leaves.length, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single leave
router.get('/:id', protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('applicant', 'name email role department rollNumber')
      .populate('reviewedBy', 'name');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    res.json({ success: true, leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST apply for leave
router.post('/', protect, async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;
    const leave = await Leave.create({
      applicant: req.user._id,
      leaveType, fromDate, toDate, reason
    });
    await leave.populate('applicant', 'name email');
    res.status(201).json({ success: true, leave });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT review leave (admin/faculty for student leaves)
router.put('/:id/review', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { status, reviewRemarks } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, reviewRemarks, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    ).populate('applicant', 'name email').populate('reviewedBy', 'name');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    res.json({ success: true, leave });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT cancel leave (applicant)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const leave = await Leave.findOne({ _id: req.params.id, applicant: req.user._id });
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    if (leave.status !== 'pending') return res.status(400).json({ success: false, message: 'Cannot cancel reviewed leave' });
    leave.status = 'cancelled';
    await leave.save();
    res.json({ success: true, leave });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE leave
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Leave deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
