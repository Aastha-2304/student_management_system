const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

// GET attendance records
router.get('/', protect, async (req, res) => {
  try {
    const { courseId, studentId, fromDate, toDate, date } = req.query;
    let query = {};
    
    if (courseId) query.course = courseId;
    if (date) {
      const d = new Date(date);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      query.date = { $gte: d, $lt: next };
    } else if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) query.date.$lte = new Date(toDate);
    }
    
    // Students see only their own records
    const attendances = await Attendance.find(query)
      .populate('course', 'name code')
      .populate('faculty', 'name')
      .populate('records.student', 'name rollNumber email')
      .sort({ date: -1 });
    
    // If student role, filter records
    let result = attendances;
    if (req.user.role === 'student' && !studentId) {
      result = attendances.map(a => ({
        ...a.toObject(),
        records: a.records.filter(r => r.student._id.toString() === req.user._id.toString())
      }));
    }
    
    res.json({ success: true, count: result.length, attendances: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET student attendance summary
router.get('/summary/:studentId', protect, authorize('admin', 'faculty', 'student'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId } = req.query;
    
    // Authorization check
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    let courseQuery = {};
    if (courseId) courseQuery._id = courseId;
    else courseQuery.students = studentId;
    
    const courses = await Course.find(courseQuery, '_id name code');
    
    const summary = await Promise.all(courses.map(async (course) => {
      const allAttendances = await Attendance.find({ course: course._id });
      const totalClasses = allAttendances.length;
      let present = 0, absent = 0, late = 0, excused = 0;
      
      allAttendances.forEach(att => {
        const record = att.records.find(r => r.student.toString() === studentId);
        if (record) {
          if (record.status === 'present') present++;
          else if (record.status === 'absent') absent++;
          else if (record.status === 'late') late++;
          else if (record.status === 'excused') excused++;
        }
      });
      
      const attended = present + late;
      const percentage = totalClasses > 0 ? ((attended / totalClasses) * 100).toFixed(1) : 0;
      
      return {
        course: { _id: course._id, name: course.name, code: course.code },
        totalClasses, present, absent, late, excused,
        percentage: parseFloat(percentage),
        isShortage: parseFloat(percentage) < 75
      };
    }));
    
    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST mark attendance (faculty)
router.post('/', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { courseId, date, session, topic, records } = req.body;
    
    // Verify faculty teaches this course
    if (req.user.role === 'faculty') {
      const course = await Course.findOne({ _id: courseId, faculty: req.user._id });
      if (!course) return res.status(403).json({ success: false, message: 'You do not teach this course' });
    }
    
    const attendance = await Attendance.findOneAndUpdate(
      { course: courseId, date: new Date(date), session },
      { course: courseId, faculty: req.user._id, date: new Date(date), session, topic, records },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    await attendance.populate('course', 'name code');
    await attendance.populate('records.student', 'name rollNumber');
    
    res.status(201).json({ success: true, attendance });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update attendance record
router.put('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, attendance });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET attendance for a specific class session
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    let query = { course: req.params.courseId };
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) query.date.$lte = new Date(toDate);
    }
    const records = await Attendance.find(query)
      .populate('records.student', 'name rollNumber')
      .sort({ date: -1 });
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
