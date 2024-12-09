const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  password: { type: String, required: true }, // Use bcrypt for hashing passwords
  isAdmin: { type: Boolean, default: false },
  reputation: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
