const User = require('../models/UserModel');
const { sendUserEmail } = require('../middleware/UserEmail');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const otpStore = {};
// Helper to generate a random 6-digit OTP
const generateOtp = () => crypto.randomInt(100000, 999999).toString();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const createUser = async (req, res) => {
  const { employeeId, name, email, phone, role } = req.body;

  try {
    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists!' });
    }

    // Create a new user
    const user = new User({
      employeeId,
      name,
      email,
      phone,
      role,
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully!' });

    // Send email notification (use try-catch to handle email sending errors)
    try {
      await sendUserEmail(
        email,
        'User Create Notification',
        `Hello ${name}, your account has been created successfully!\n Your role is : ${role} \n\nRegards,\nYour Team`
      );
    } catch (emailError) {
      console.error('Error sending email:', emailError.message);
      // Optionally log email errors, but don't fail the response
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error occurred.' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    // If no users are found, send a 404 response
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    // Sending the users data in the response
    res.status(200).json({ message: 'Users fetched successfully', users });
  } catch (error) {
    // Handling errors with a 500 response
    res
      .status(500)
      .json({ message: 'Failed to fetch users', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.body; // Extract user ID from the request body
  try {
    // Find and delete the user by ID
    const deletedUser = await User.findByIdAndDelete(id);
    // If no user is found, send a 404 error
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found!' });
    }
    // Respond with success message
    res.status(200).json({ message: 'User deleted successfully!' });
  } catch (error) {
    // Handle potential errors
    res.status(500).json({ message: error.message });
  }
};

// Send OTP API
const sendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'Email ID not found' });
  }

  const otp = generateOtp();

  // Store OTP in the in-memory store
  otpStore[email] = { otp, timestamp: Date.now() };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Login OTP',
    text: `Your OTP is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending OTP:', error);
      return res.status(500).json({ message: 'Error sending OTP' });
    } else {
      res.status(200).json({ message: 'OTP sent successfully' });
    }
  });
};
// Verify OTP API
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  // Check if OTP exists for the email
  if (!otpStore[email] || otpStore[email].otp !== otp) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP or OTP expired',
    });
  }

  // Optionally, check for OTP expiration
  const otpAge = Date.now() - otpStore[email].timestamp;
  if (otpAge > 5 * 60 * 1000) {
    // 5 minutes
    delete otpStore[email];
    return res.status(400).json({
      success: false,
      message: 'OTP expired',
    });
  }

  try {
    // Fetch user details from the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Define expiration time for the token
    const expiresIn = '12h'; // Token valid for 12 hours

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn } // Pass the defined expiration time
    );

    // Clear OTP from the store
    delete otpStore[email];

    // Send response
    res.cookie('pdi_cookie', token, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      existUser: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role, // Assuming role exists in the User model
      },
      token,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
const logOut = async (req, res) => {
  try {
    res.clearCookie('pdi_cookie');
    res.status(200).json({ message: 'logout successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'interanl server ereo' });
  }
};
const checkUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
    console.log(error);
  }
};

module.exports = {
  createUser,
  getUsers,
  deleteUser,
  sendOtp,
  verifyOtp,
  logOut,
  checkUser,
};
