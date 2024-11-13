const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'SPC', 'Sales User'],
  },
  otp: {
    type: String,
  },
  otpExpiresAt: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Exporting the User model
const AdminCreateUser = mongoose.model('AdminCreateUser', userSchema);
module.exports = AdminCreateUser;
