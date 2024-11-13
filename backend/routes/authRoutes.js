const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logOut,
  checkUser,
} = require("../controllers/authControllers");
const { isUser } = require("../middleware/verifyToken");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logOut);
router.get("/checkUser", isUser, checkUser);

module.exports = router;
