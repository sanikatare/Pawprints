const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Pet = require('../models/Pet');
const Diagnosis = require('../models/Diagnosis');
const Appointment = require('../models/Appointment');
const ForumPost = require('../models/ForumPost');

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const [users, pets, diagnoses, appointments, posts] = await Promise.all([
      User.countDocuments(),
      Pet.countDocuments(),
      Diagnosis.countDocuments(),
      Appointment.countDocuments(),
      ForumPost.countDocuments()
    ]);
    res.json({ users, pets, diagnoses, appointments, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/appointments', auth, isAdmin, async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('user', 'name email').populate('pet', 'name').sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/appointments/:id', auth, isAdmin, async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
