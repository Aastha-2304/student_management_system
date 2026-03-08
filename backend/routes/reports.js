const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Leave = require('../models/Leave');
const { auth, authorize } = require('../middleware/auth');
const mongoose = require('mongoose');

// @GET /api/reports/defaulters - Students below threshold attendance
router.get('/defaulters', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { threshold = 75, subjectId } = req.query;

    const matchQuery = {};
    if (subjectId) matchQuery.subject = mongoose.Types.ObjectId.createFromHexString(subjectId);

    const pipeline = [
      { $match: matchQuery },
      { $unwind: '$records' },
      {
        $group: {
          _id: { student: '$records.student', subject: '$subject' },
          totalClasses: { $sum: 1 },
          present: { $sum: { $cond: [{ $in: ['$records.status', ['present', 'late']] }, 1, 0] } },
        }
      },
      {
        $addFields: {
          percentage: { $multiply: [{ $divide: ['$present', '$totalClasses'] }, 100] }
        }
      },
      { $match: { percentage: { $lt: parseFloat(threshold) } } },
      {
        $lookup: { from: 'users', localField: '_id.student', foreignField: '_id', as: 'student' }
      },
      {
        $lookup: { from: 'subjects', localField: '_id.subject', foreignField: '_id', as: 'subject' }
      },
      { $unwind: '$student' },
      { $unwind: '$subject' },
      { $sort: { percentage: 1 } }
    ];

    const defaulters = await Attendance.aggregate(pipeline);
    res.json({ success: true, defaulters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/reports/class-summary - Class-wise attendance summary
router.get('/class-summary', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { subjectId, startDate, endDate } = req.query;
    const matchQuery = {};
    if (subjectId) matchQuery.subject = mongoose.Types.ObjectId.createFromHexString(subjectId);
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }
    if (req.user.role === 'faculty') matchQuery.faculty = req.user._id;

    const pipeline = [
      { $match: matchQuery },
      { $unwind: '$records' },
      {
        $group: {
          _id: { date: '$date', subject: '$subject' },
          totalStudents: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$records.status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$records.status', 'late'] }, 1, 0] } },
        }
      },
      {
        $lookup: { from: 'subjects', localField: '_id.subject', foreignField: '_id', as: 'subject' }
      },
      { $unwind: '$subject' },
      { $sort: { '_id.date': -1 } }
    ];

    const summary = await Attendance.aggregate(pipeline);
    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/reports/dashboard - Admin dashboard stats
router.get('/dashboard', auth, authorize('admin'), async (req, res) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      pendingLeaves,
      todayAttendance
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'faculty', isActive: true }),
      Leave.countDocuments({ status: 'pending' }),
      Attendance.find({ date: { 
        $gte: new Date(new Date().setHours(0,0,0,0)), 
        $lte: new Date(new Date().setHours(23,59,59,999)) 
      }})
    ]);

    const totalPresent = todayAttendance.reduce((acc, a) => 
      acc + a.records.filter(r => r.status === 'present').length, 0);
    const totalAbsent = todayAttendance.reduce((acc, a) => 
      acc + a.records.filter(r => r.status === 'absent').length, 0);

    // Monthly attendance trend (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      
      const dayAttendance = await Attendance.find({ date: { $gte: start, $lte: end } });
      const present = dayAttendance.reduce((acc, a) => 
        acc + a.records.filter(r => r.status === 'present').length, 0);
      const absent = dayAttendance.reduce((acc, a) => 
        acc + a.records.filter(r => r.status === 'absent').length, 0);

      last7Days.push({
        date: start.toISOString().split('T')[0],
        present,
        absent,
        total: present + absent
      });
    }

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalFaculty,
        pendingLeaves,
        todayClasses: todayAttendance.length,
        todayPresent: totalPresent,
        todayAbsent: totalAbsent,
        attendanceRate: totalPresent + totalAbsent > 0 
          ? ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(1) 
          : 0,
        last7Days
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
