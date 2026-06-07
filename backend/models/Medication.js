const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String },
  frequency: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  notes: { type: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Medication', MedicationSchema);
