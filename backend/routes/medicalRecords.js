const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');
const { medicalFileUpload } = require('../middleware/upload');

router.get('/:petId', auth, async (req, res) => {
  try {
    const records = await MedicalRecord.find({ pet: req.params.petId, user: req.user.id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, medicalFileUpload.single('file'), async (req, res) => {
  try {
    const recordData = { ...req.body, user: req.user.id };
    if (req.file) recordData.fileUrl = `/uploads/medical/${req.file.filename}`;
    const record = new MedicalRecord(recordData);
    await record.save();
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await MedicalRecord.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!result) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
