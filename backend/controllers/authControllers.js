const UserModel = require('../models/UserModel');
const AdminCreateUser = require('../models/AdminCreateUser');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    const [existUser, existPhone] = await Promise.all([
      UserModel.findOne({ email }),
      UserModel.findOne({ phone }),
    ]);

    if (existUser) {
      return res
        .status(409)
        .json({ success: false, message: 'Email already in use' });
    }
    if (existPhone) {
      return res
        .status(409)
        .json({ success: false, message: 'Phone number already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new UserModel({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(200).json({ message: 'user register successfully', newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'interanl server ereo' });
    console.log(error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check for user in UserModel
    let existUser = await UserModel.findOne({ email }).lean();
    // If not found, check in AdminCreateUser
    if (!existUser) {
      existUser = await AdminCreateUser.findOne({ email }).lean();
    }
    if (!existUser) {
      return res
        .status(401)
        .json({ success: false, message: 'User not exists' });
    }
    const isPasswordValid = await bcrypt.compare(password, existUser.password);
    if (!isPasswordValid) {
      return res
        .status(404)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: existUser._id }, JWT_SECRET);
    res.cookie('pdi_cookie', token, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    });

    delete existUser.password; // Remove password from the response
    res
      .status(200)
      .json({ success: true, message: 'Login successfully', existUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
    delete user.password;
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
    console.log(error);
  }
};

module.exports = { register, login, logOut, checkUser };
