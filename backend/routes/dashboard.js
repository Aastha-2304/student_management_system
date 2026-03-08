const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const role = req.user.role;
    let stats = {};

    if (role === 'admin') {
      const [totalStudents, totalFaculty, totalCourses, pendingLeaves, todayAttendances, recentLeaves] = await Promise.all([
        User.countDocuments({ role: 'student', isActive: true }),
        User.countDocuments({ role: 'faculty', isActive: true }),
        Course.countDocuments({ isActive: true }),
        Leave.countDocuments({ status: 'pending' }),
        Attendance.find({ date: { $gte: new Date(new Date().setHours(0,0,0,0)) } }).populate('course', 'name code'),
        Leave.find({ status: 'pending' }).populate('applicant', 'name role').sort({ createdAt: -1 }).limit(5)
      ]);
      
      // Monthly attendance trend (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const monthlyData = await Attendance.aggregate([
        { $match: { date: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);
      
      stats = { totalStudents, totalFaculty, totalCourses, pendingLeaves, todayAttendances: todayAttendances.length, recentLeaves, monthlyData };
    } 
    
    else if (role === 'faculty') {
      const courses = await Course.find({ _id: { $in: req.user.teachingCourses } });
      const totalStudents = courses.reduce((sum, c) => sum + c.students.length, 0);
      const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
      const todayAttendances = await Attendance.find({ 
        faculty: req.user._id,
        date: { $gte: new Date(new Date().setHours(0,0,0,0)) }
      }).populate('course', 'name code');
      
      stats = { totalCourses: courses.length, totalStudents, pendingLeaves, todayAttendances };
    } 
    
    else {
      // Student dashboard
      const Attendance = require('../models/Attendance');
      const allAttendances = await Attendance.find({ 'records.student': req.user._id });
      let present = 0, total = 0;
      allAttendances.forEach(a => {
        const rec = a.records.find(r => r.student.toString() === req.user._id.toString());
        if (rec) { total++; if (rec.status === 'present' || rec.status === 'late') present++; }
      });
      
      const myLeaves = await Leave.countDocuments({ applicant: req.user._id });
      const pendingLeaves = await Leave.countDocuments({ applicant: req.user._id, status: 'pending' });
      const enrolledCourses = req.user.enrolledCourses?.length || 0;
      
      stats = {
        enrolledCourses,
        overallAttendance: total > 0 ? ((present/total)*100).toFixed(1) : 0,
        totalClasses: total,
        presentClasses: present,
        myLeaves,
        pendingLeaves
      };
    }

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
