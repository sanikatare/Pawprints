const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WeightLog = require('../models/WeightLog');
const Pet = require('../models/Pet');

router.get('/:petId', auth, async (req, res) => {
  try {
    const logs = await WeightLog.find({ pet: req.params.petId, user: req.user.id })
      .sort({ date: 1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { pet, weight, date, notes } = req.body;
    const petDoc = await Pet.findOne({ _id: pet, owner: req.user.id });
    if (!petDoc) return res.status(404).json({ message: 'Pet not found' });

    const log = new WeightLog({ pet, user: req.user.id, weight, date, notes });
    await log.save();

    petDoc.weight = weight;
    await petDoc.save();

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await WeightLog.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Weight log deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
