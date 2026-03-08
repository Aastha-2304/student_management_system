const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET all users (admin, faculty)
router.get('/', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { role, department, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { rollNumber: new RegExp(search, 'i') }];
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET faculty's students
router.get('/my-students', protect, authorize('faculty'), async (req, res) => {
  try {
    // Get full faculty document from DB
    const faculty = await User.findById(req.user._id);

    if (!faculty || !faculty.teachingCourses.length) {
      return res.json({ success: true, students: [] });
    }

    const students = await User.find({
      role: 'student',
      enrolledCourses: { $in: faculty.teachingCourses }
    }).select('name rollNumber email');

    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single user
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('enrolledCourses').populate('teachingCourses');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update user (admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE user (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
