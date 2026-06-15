const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  aadhaarNumber: { type: String },
  aadhaarName: { type: String },
}, { timestamps: true });

// Email index is already unique: true, but let's make it explicit for speed
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
