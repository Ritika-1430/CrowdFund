const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  targetAmount: { type: Number, required: true },
  amountCollected: { type: Number, default: 0 },
  donorCount: { type: Number, default: 0 },
  beneficiary: {
    name: String,
    contact: String,
    relation: String
  },
  // Gallery of photos for the fund (stored as URL or base64 data URL)
  photos: [{ url: String, alt: String }],
  documents: [{ url: String, type: String }],
  location: String,
  emergency: { type: Boolean, default: false },
  status: { type: String, enum: ['Pending','Verified','Active','Completed','Rejected'], default: 'Pending' },
  deadline: Date,
  // Optional breakdown items can include an image per item
  breakdownItems: [{
    name: String,
    description: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    image: { url: String, alt: String }
  }],
  // Campaign progress updates posted by creators
  updates: [{
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { url: String },
    createdAt: { type: Date, default: Date.now }
  }],
  hospitalEscrow: {
    hospitalName: String,
    accountNumber: String,
    ifscCode: String,
    isDirectPayoutEnabled: { type: Boolean, default: false },
    disbursedAmount: { type: Number, default: 0 }
  },
  milestones: [{
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    description: String,
    status: { type: String, enum: ['Locked', 'Active', 'Released'], default: 'Locked' },
    approvals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  preVerifiedRegistryId: { type: String },
  parentFundId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fund' },
}, { timestamps: true });

// Optimize queries for massive scale
fundSchema.index({ status: 1, createdAt: -1 });
fundSchema.index({ category: 1, status: 1 });
fundSchema.index({ creatorId: 1 });
fundSchema.index({ emergency: 1, status: 1 });

module.exports = mongoose.model('Fund', fundSchema);
