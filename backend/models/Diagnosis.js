const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symptoms: [{ type: String }],
  predictedDiseases: [{
    disease: String,
    confidence: Number,
    description: String
  }],
  treatments: [{ type: String }],
  precautions: [{ type: String }],
  severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'], default: 'Mild' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Diagnosis', DiagnosisSchema);
