const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');

router.get('/', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id }).populate('pet', 'name breed').sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const appointment = new Appointment({ ...req.body, user: req.user.id });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Appointment.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
