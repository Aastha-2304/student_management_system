const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { department, semester, faculty } = req.query;
    const query = { isActive: true };
    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (faculty) query.faculty = faculty;

    // If student, return only enrolled subjects
    if (req.user.role === 'student') {
      query._id = { $in: req.user.enrolledSubjects };
    }
    // If faculty, return only assigned subjects
    if (req.user.role === 'faculty') {
      query.faculty = req.user._id;
    }

    const subjects = await Subject.find(query)
      .populate('department', 'name code')
      .populate('faculty', 'name email');
    res.json({ success: true, subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    await subject.populate('department', 'name code');
    res.status(201).json({ success: true, message: 'Subject created', subject });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Subject code already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('department', 'name code')
      .populate('faculty', 'name email');
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, subject });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await Subject.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Subject deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
