const express = require("express");
const { isUser } = require("../middleware/verifyToken.js");
const {
  getAllName,
  dummyUpdateServiceRequestStatus,
  quoteCreate,

  getQuotationAllocationLogs,
  // allocateForInvoice,
  getInvoiceAllocationLogs,
  updateExistingSR,

  getALlocatedRequestsForSpc,
  getAllQuotationNumbers,
  revokeBillingEditStatus,
} = require("../controllers/serviceRequestController.js");

const { celebrate, errors, Joi } = require("celebrate");
const { uploadFiles } = require("../multerConfig.js");
const router = express.Router();

// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// const authMiddleware = require('../middlewares/authMiddleware.js');
router.post("/create-quotation", quoteCreate);

router.get("/v1/names", getAllName);
router.put("/v1/dummyUpdateSR", dummyUpdateServiceRequestStatus);
// router.post('/v1/allocate-invoice', allocateForInvoice);
router.post("/v1/allocate-quotation-logs", getQuotationAllocationLogs);
router.post("/v1/allocate-invoice-logs", getInvoiceAllocationLogs);
router.put("/v1/update-existing-sr", updateExistingSR);
router.post("/v1/get-allocated-spc", getALlocatedRequestsForSpc);
router.get("/v1/get-quotationNo", getAllQuotationNumbers);
router.put("/v1/revokeBillingEditStatus", revokeBillingEditStatus);
router.use(errors());

module.exports = router;
