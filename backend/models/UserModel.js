const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  phone: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    require: true,
    enum: [
      "admin",
      "billingManager",
      "billingAgent",
      "C&LManager",
      "inspector",
      "salesUser",
    ],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Exporting the User model
const User = mongoose.model("User", userSchema);
module.exports = User;
