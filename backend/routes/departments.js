const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).populate('hod', 'name email');
    res.json({ success: true, departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const dept = new Department(req.body);
    await dept.save();
    res.status(201).json({ success: true, message: 'Department created', department: dept });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Department name or code already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, department: dept });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await Department.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Department deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
