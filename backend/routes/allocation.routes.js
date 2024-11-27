const express = require("express");
const router = express.Router();
const {
  allocateForQuotation,
  getUsers,
} = require("../controllers/allocation.controller");
const { isUser } = require("../middleware/verifyToken");

router.post("/v1/allocate", isUser, allocateForQuotation);
router.get("/v1/users", getUsers);

module.exports = router;
