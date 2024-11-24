const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers,
  sendOtp,
  verifyOtp,
  logOut,
  checkUser,
} = require("../controllers/authControllers");
const { isUser } = require("../middleware/verifyToken");

router.post("/createUser", createUser);
router.get("/get-users", getUsers);
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/logout", logOut);
router.get("/checkUser", isUser, checkUser);

module.exports = router;
