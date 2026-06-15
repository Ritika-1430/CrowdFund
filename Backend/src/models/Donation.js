const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  fundId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fund', required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  donorName: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentStatus: { type: String, enum: ['pending','success','failed'], default: 'success' },
  comment: { type: String },
  isAnonymous: { type: Boolean, default: false },
  isPrivateMode: { type: Boolean, default: false },
  matchingPartner: { type: String },
  request80G: { type: Boolean, default: false },
  panNumber: { type: String },
  email: { type: String },
  mobile: { type: String },
  metadata: Object
}, { timestamps: true });

// Optimize query patterns
donationSchema.index({ fundId: 1, paymentStatus: 1, createdAt: -1 });
donationSchema.index({ donorId: 1, createdAt: -1 });

module.exports = mongoose.model('Donation', donationSchema);
