const mongoose = require('mongoose');

const WeightLogSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weight: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WeightLog', WeightLogSchema);
