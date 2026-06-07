const mongoose = require('mongoose');

const VaccinationSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vaccineName: { type: String, required: true },
  dateAdministered: { type: Date },
  nextDueDate: { type: Date },
  veterinarian: { type: String },
  notes: { type: String },
  reminded: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vaccination', VaccinationSchema);
