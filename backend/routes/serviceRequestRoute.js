const express = require('express');
const { isUser } = require('../middleware/verifyToken.js');
const {
  createServiceRequest,
  getServiceRequest,
  getServiceRequestByStatus,
  getAllServiceRequest,
  getAllName,
  dummyUpdateServiceRequestStatus,
  quoteCreate,
  allocateForQuotation,
  getQuotationAllocationLogs,
  // allocateForInvoice,
  getInvoiceAllocationLogs,
  updateExistingSR,
  updateServiceRequestStatus,
  getALlocatedRequestsForSpc,
  getAllQuotationNumbers,
  revokeBillingEditStatus,
} = require('../controllers/serviceRequestController.js');
const {
  serviceRequestValidationSchema,
  // allocateValidationSchema,
  getServiceRequestValidation,
} = require('../validations/serviceRequestValidation.js');
const { celebrate, errors, Joi } = require('celebrate');
const { uploadFiles } = require('../multerConfig.js');
const router = express.Router();

// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// router.post('/get-quotation-data', sapData);
router.post('/create-service-request', uploadFiles, createServiceRequest);

// const authMiddleware = require('../middlewares/authMiddleware.js');
router.post('/create-quotation', quoteCreate);

router.get('/get-service-request', isUser, getAllServiceRequest);
router.get('/get-service-status', getServiceRequestByStatus);

router.get(
  '/display-report',
  celebrate(getServiceRequestValidation),
  getServiceRequest
);

router.get('/v1/names', getAllName);
router.put('/v1/dummyUpdateSR', dummyUpdateServiceRequestStatus);
router.post('/v1/allocate', isUser, allocateForQuotation);
// router.post('/v1/allocate-invoice', allocateForInvoice);
router.post('/v1/allocate-quotation-logs', getQuotationAllocationLogs);
router.post('/v1/allocate-invoice-logs', getInvoiceAllocationLogs);
router.put('/v1/update-existing-sr', updateExistingSR);
router.post('/v1/get-allocated-spc', getALlocatedRequestsForSpc);
router.get('/v1/get-quotationNo', getAllQuotationNumbers);
router.put('/v1/revokeBillingEditStatus', revokeBillingEditStatus);
router.use(errors());

module.exports = router;
