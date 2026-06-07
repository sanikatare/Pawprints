const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Medication = require('../models/Medication');

router.get('/', auth, async (req, res) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.pet) filter.pet = req.query.pet;
    const medications = await Medication.find(filter)
      .populate('pet', 'name species')
      .sort({ createdAt: -1 });
    res.json(medications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const medication = new Medication({ ...req.body, user: req.user.id });
    await medication.save();
    await medication.populate('pet', 'name species');
    res.status(201).json(medication);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    ).populate('pet', 'name species');
    if (!medication) return res.status(404).json({ message: 'Medication not found' });
    res.json(medication);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Medication.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Medication deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
