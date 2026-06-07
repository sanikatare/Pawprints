const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vetName: { type: String, required: true },
  vetClinic: { type: String },
  date: { type: Date, required: true },
  time: { type: String },
  reason: { type: String },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
  notes: { type: String },
  reminderSent: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
