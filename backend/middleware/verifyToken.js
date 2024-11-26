const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const User = require('../models/UserModel');

const isUser = async (req, res, next) => {
  try {
    const token = req.cookies.pdi_cookie;
    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized: No token provided',
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    // First check in UserModel
    let user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

module.exports = { isUser };
