const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    contact_number: { type: String, required: true },
    role: { type: String, enum: ['renter', 'contractor'], required: true },
    passwordHash: { type: String, required: true },
    agreed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
