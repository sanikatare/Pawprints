const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  species: { type: String, default: 'Dog' },
  breed: { type: String },
  age: { type: Number },
  weight: { type: Number },
  gender: { type: String, enum: ['Male', 'Female'] },
  photo: { type: String },
  dietaryNeeds: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pet', PetSchema);
