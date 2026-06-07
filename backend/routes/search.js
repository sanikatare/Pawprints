const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Pet = require('../models/Pet');
const Appointment = require('../models/Appointment');
const Vaccination = require('../models/Vaccination');
const MedicalRecord = require('../models/MedicalRecord');
const ForumPost = require('../models/ForumPost');
const Diagnosis = require('../models/Diagnosis');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/suggestions', auth, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ suggestions: [] });

    const regex = new RegExp(escapeRegex(q), 'i');
    const userId = req.user.id;
    const limit = 8;
    const suggestions = [];

    const pets = await Pet.find({ owner: userId, name: regex }).limit(3);
    pets.forEach((p) => suggestions.push({ type: 'pets', label: p.name, sub: p.breed || p.species }));

    const vaccines = await Vaccination.find({ user: userId, vaccineName: regex })
      .populate('pet', 'name')
      .limit(2);
    vaccines.forEach((v) =>
      suggestions.push({ type: 'vaccinations', label: v.vaccineName, sub: v.pet?.name })
    );

    const records = await MedicalRecord.find({ user: userId, title: regex }).limit(2);
    records.forEach((r) => suggestions.push({ type: 'records', label: r.title, sub: r.type }));

    res.json({ suggestions: suggestions.slice(0, limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);
    if (!q || q.length < 2) {
      return res.json({ results: { pets: [], appointments: [], vaccinations: [], records: [], posts: [], diagnoses: [] } });
    }

    const regex = new RegExp(escapeRegex(q), 'i');
    const userId = req.user.id;

    const [pets, appointments, vaccinations, records, posts, diagnoses] = await Promise.all([
      Pet.find({
        owner: userId,
        $or: [{ name: regex }, { breed: regex }, { species: regex }],
      })
        .limit(limit)
        .lean(),
      Appointment.find({
        user: userId,
        $or: [{ vetName: regex }, { vetClinic: regex }, { reason: regex }],
      })
        .populate('pet', 'name species')
        .limit(limit)
        .lean(),
      Vaccination.find({
        user: userId,
        $or: [{ vaccineName: regex }, { veterinarian: regex }],
      })
        .populate('pet', 'name')
        .limit(limit)
        .lean(),
      MedicalRecord.find({
        user: userId,
        $or: [{ title: regex }, { notes: regex }, { type: regex }],
      })
        .populate('pet', 'name')
        .limit(limit)
        .lean(),
      ForumPost.find({
        $or: [{ title: regex }, { content: regex }, { category: regex }],
      })
        .populate('author', 'name')
        .limit(limit)
        .lean(),
      Diagnosis.find({
        user: userId,
        $or: [{ symptoms: regex }, { 'predictedDiseases.disease': regex }],
      })
        .populate('pet', 'name')
        .limit(limit)
        .lean(),
    ]);

    res.json({
      results: {
        pets,
        appointments,
        vaccinations,
        records,
        posts,
        diagnoses,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
