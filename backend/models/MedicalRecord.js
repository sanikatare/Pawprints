const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['Prescription', 'Lab Report', 'X-Ray', 'Vaccination', 'Other'], default: 'Other' },
  fileUrl: { type: String },
  notes: { type: String },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
