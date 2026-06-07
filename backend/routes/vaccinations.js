const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Vaccination = require('../models/Vaccination');

// Static routes MUST come before /:petId
router.get('/reminders/upcoming', auth, async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const reminders = await Vaccination.find({
      user: req.user.id,
      nextDueDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
    }).populate('pet', 'name');
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:petId', auth, async (req, res) => {
  try {
    const vaccinations = await Vaccination.find({ pet: req.params.petId, user: req.user.id }).sort({ nextDueDate: 1 });
    res.json(vaccinations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const vaccination = new Vaccination({ ...req.body, user: req.user.id });
    await vaccination.save();
    res.status(201).json(vaccination);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const vaccination = await Vaccination.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!vaccination) return res.status(404).json({ message: 'Vaccination not found' });
    res.json(vaccination);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Vaccination.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!result) return res.status(404).json({ message: 'Vaccination not found' });
    res.json({ message: 'Vaccination record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
