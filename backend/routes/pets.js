const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Pet = require('../models/Pet');
const { petPhotoUpload } = require('../middleware/upload');

router.get('/', auth, async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user.id });
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, petPhotoUpload.single('photo'), async (req, res) => {
  try {
    const petData = { ...req.body, owner: req.user.id };
    if (req.file) petData.photo = `/uploads/${req.file.filename}`;
    const pet = new Pet(petData);
    await pet.save();
    res.status(201).json(pet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, petPhotoUpload.single('photo'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.photo = `/uploads/${req.file.filename}`;
    const pet = await Pet.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      updateData,
      { new: true }
    );
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Pet.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!result) return res.status(404).json({ message: 'Pet not found' });
    res.json({ message: 'Pet deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
