const express = require("express");
const router = express.Router();
const { isUser } = require("../middleware/verifyToken");
const { uploadFiles } = require("../multerConfig");
const { celebrate, errors, Joi } = require("celebrate");
const {
  serviceRequestValidationSchema,
  // allocateValidationSchema,
  getServiceRequestValidation,
} = require("../validations/serviceRequestValidation");
const {
  createServiceRequest,
  getServiceRequest,
  getServiceRequestByStatus,
  getAllServiceRequest,
  updateServiceRequestStatus,
} = require("../controllers/billingRequest.controller");

// router.post('/get-quotation-data', sapData);
router.post("/create-service-request", uploadFiles, createServiceRequest);
router.get("/get-service-request", isUser, getAllServiceRequest);
router.get("/get-service-status", getServiceRequestByStatus);

router.get(
  "/display-report",
  celebrate(getServiceRequestValidation),
  getServiceRequest
);

router.use(errors());

module.exports = router;
