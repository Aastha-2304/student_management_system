const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET all courses
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query._id = { $in: req.user.enrolledCourses };
    } else if (req.user.role === 'faculty') {
      query._id = { $in: req.user.teachingCourses };
    }
    const { department, semester } = req.query;
    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    
    const courses = await Course.find(query)
      .populate('faculty', 'name email employeeId')
      .populate('students', 'name email rollNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single course
router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('faculty', 'name email')
      .populate('students', 'name email rollNumber');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create course (admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.create(req.body);
    if (req.body.faculty) {
      await User.findByIdAndUpdate(req.body.faculty, { $addToSet: { teachingCourses: course._id } });
    }
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update course (admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, course });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST enroll students
router.post('/:id/enroll', protect, authorize('admin'), async (req, res) => {
  try {
    const { studentIds } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { students: { $each: studentIds } } },
      { new: true }
    );
    await User.updateMany(
      { _id: { $in: studentIds } },
      { $addToSet: { enrolledCourses: req.params.id } }
    );
    res.json({ success: true, course, message: `${studentIds.length} students enrolled` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE course
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Course.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Course deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
