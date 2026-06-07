const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Diagnosis = require('../models/Diagnosis');

// Static routes MUST come before /:petId
router.get('/stats/:petId', auth, async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find({ pet: req.params.petId, user: req.user.id });
    const stats = {
      totalDiagnoses: diagnoses.length,
      severityBreakdown: { Mild: 0, Moderate: 0, Severe: 0 },
      monthlyData: {},
      commonSymptoms: {},
    };

    diagnoses.forEach((d) => {
      stats.severityBreakdown[d.severity] = (stats.severityBreakdown[d.severity] || 0) + 1;
      const month = new Date(d.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      stats.monthlyData[month] = (stats.monthlyData[month] || 0) + 1;
      d.symptoms.forEach((s) => {
        stats.commonSymptoms[s] = (stats.commonSymptoms[s] || 0) + 1;
      });
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:petId', auth, async (req, res) => {
  try {
    const history = await Diagnosis.find({ pet: req.params.petId, user: req.user.id }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
