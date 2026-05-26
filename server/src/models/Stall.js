// models/Stall.js
const mongoose = require('mongoose');

const stallSchema = new mongoose.Schema({
  stallNumber:    { type: String, required: true },
  section:        { type: String, required: true },
  color:          { type: String },
  floorArea:      { type: String, enum: ['upper', 'lower'] },
  floorCol:       { type: String },
  floorRow:       { type: Number },
  hasStallNumber: { type: Boolean, default: true },
  status:         { type: String, enum: ['available', 'occupied', 'pending'], default: 'available' },
  size:           { type: Number, default: 12 },
  sizeUnit:       { type: String, default: 'sqm' },
  monthlyRate:    { type: Number },
  currency:       { type: String, default: 'PHP' },
  amenities:      [{ type: String }],
  listing: {
    isActive:  { type: Boolean, default: true },
    autoRenew: { type: Boolean, default: false },
    listedAt:  { type: Date },
  },
  // ✅ tenant is an object with defaults — never null
  tenant: {
    name:       { type: String, default: null },
    contact:    { type: String, default: null },
    email:      { type: String, default: null },
    leaseStart: { type: Date,   default: null },
    leaseEnd:   { type: Date,   default: null },
  },
}, { timestamps: true });

module.exports = mongoose.model('Stall', stallSchema);