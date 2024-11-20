const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  serviceRequestId: {
    type: String,
    unique: true,
  },
  quotationNo: {
    type: String,
  },
  quoteStatus: {
    type: String,
  },
  industryDiv: {
    type: String,
    enum: ['BCP', 'GCI', 'SEM', 'Mining'],
  },
  zone: {
    type: String,
    enum: [
      'Zone1',
      'Zone2',
      'Zone3',
      'Zone4',
      'Zone5',
      'Zone6',
      'Zone7',
      'Zone8',
    ],
  },
  equipmentSerialNo: {
    type: String,
  },
  modelNo: {
    type: String,
  },
  customerName: {
    type: String,
  },
  billingPlant: {
    type: String,
  },
  salesUserOnBehalfOf: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  remarks: {
    type: String,
  },
  files: [String], // Optional single file path

  registeredAt: {
    type: Date,
    default: Date.now,
  },
  quoteStatus: {
    type: String,
    enum: [
      'PendingRelease',
      'ApprovalPending',
      'BillingPending',
      'Rejected',
      'Billed',
    ],
    // default: 'PendingRelease',
  },

  billingProgressStatus: {
    type: String,
    enum: [
      'PendingForQuotationAllocation',
      'QuotationInProgress',
      'PendingforInvoiceAllocation',
      'InvoicingInProgress',
      'Closed',
    ],
    // default: 'PendingForQuotationAllocation'
  },
  billingEditStatus: {
    type: String,
    enum: ['None', 'OnHold', 'Reject'],
  },
  allocatedTo_name: {
    type: String,
  },
  allocatedTo_email: {
    type: String,
  },
  reallocatedTo_name: {
    type: String,
  },
  reallocatedTo_email: {
    type: String,
  },
  allocatedBy: {
    type: String,
    // ref: 'users'
  },
  allocatedAt: {
    type: Date,
  },
  reallocatedAt: {
    type: String,
    ref: 'AdminCreateUser',
  },
  approvedAt: {
    type: Date,
  },
  releasedAt: {
    type: Date,
  },
  rejectedAt: {
    type: Date,
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now,
  },
  // }, {
  //     timestamps: true
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
module.exports = ServiceRequest;
