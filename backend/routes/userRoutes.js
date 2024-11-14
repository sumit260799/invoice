const express = require("express");
const mongoose = require("mongoose");
const AdminCreateUser = require("../models/AdminCreateUser"); // Adjust path as needed
const bcrypt = require("bcryptjs");
const router = express.Router();

// Route to create a new user
router.post("/create-user", async (req, res) => {
  const { employeeId, name, email, password, phone, role } = req.body;
  console.log("🚀 ----------------------------------🚀");
  console.log("🚀  router.post  req.body", req.body);
  console.log("🚀 ----------------------------------🚀");

  try {
    const existingUser = await AdminCreateUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new AdminCreateUser({
      employeeId,
      name,
      email,
      phone,
      role,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/get-users", async (req, res) => {
  try {
    const users = await AdminCreateUser.find();

    // If no users are found, send a 404 response
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Sending the users data in the response
    res.status(200).json({ message: "Users fetched successfully", users });
  } catch (error) {
    // Handling errors with a 500 response
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
});

module.exports = router;
