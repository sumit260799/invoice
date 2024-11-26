const express = require('express');
const router = express.Router();
const {
  createUser,
  getUsers,
  deleteUser,
  sendOtp,
  verifyOtp,
  logOut,
  checkUser,
} = require('../controllers/authControllers');
const { isUser } = require('../middleware/verifyToken');

router.post('/createUser', createUser);
router.get('/get-users', getUsers);
router.delete('/deleteUser', deleteUser);
router.post('/sendOtp', sendOtp);
router.post('/verifyOtp', verifyOtp);
router.post('/logout', logOut);
router.get('/checkUser', isUser, checkUser);

module.exports = router;
