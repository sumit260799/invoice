const express = require('express');
const QuoteModel = require('../models/quotationModel.js');
const ServiceRequest = require('../models/serviceRequestSchema.js');
const Counter = require('../models/counterModel.js');
const {
  createServiceRequest,
  getServiceRequest,
  getServiceRequestByStatus,
  getAllServiceRequest,
  allocateServiceRequest,
  getAllName,
  dummyUpdateServiceRequestStatus,
  quoteCreate,
  allocateForQuotation,
  getQuotationAllocationLogs,
  // allocateForInvoice,
  getInvoiceAllocationLogs,
  updateServiceRequestStatus,
} = require('../controllers/serviceRequestController.js');
const {
  serviceRequestValidationSchema,
  // allocateValidationSchema,
  getServiceRequestValidation,
} = require('../validations/serviceRequestValidation.js');
const { celebrate, errors, Joi } = require('celebrate');
// const authMiddleware = require('../middlewares/authMiddleware.js');
const { uploadFiles } = require('../multerConfig.js');
const router = express.Router();

// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// router.post('/get-quotation-data', sapData);
router.post('/create-service-request', uploadFiles, createServiceRequest);

router.post('/create-quotation', quoteCreate);

router.get('/get-service-request', getAllServiceRequest);
router.get('/get-service-status', getServiceRequestByStatus);

router.get(
  '/display-report',
  celebrate(getServiceRequestValidation),
  getServiceRequest
);

router.post(
  '/allocate',
  // celebrate(allocateValidationSchema),
  allocateServiceRequest
);

router.get('/v1/names', getAllName);
router.put('/v1/dummyUpdateSR', dummyUpdateServiceRequestStatus);
router.post('/v1/allocate', allocateForQuotation);
// router.post('/v1/allocate-invoice', allocateForInvoice);
router.post('/v1/allocate-quotation-logs', getQuotationAllocationLogs);
router.post('/v1/allocate-invoice-logs', getInvoiceAllocationLogs);
router.use(errors());

module.exports = router;
