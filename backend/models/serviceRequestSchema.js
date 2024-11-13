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
    default: 'PendingRelease',
  },

  srStatus: {
    type: String,
    enum: [
      'PendingForQuotationAllocation',
      'OnHold',
      'QuotationInProgress',
      'PendingforInvoiceAllocation',
      'InvoicingInProgress',
      'Closed',
    ],
    default: 'PendingForQuotationAllocation',
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

// serviceRequestSchema.set('toObject', {
//   transform: (doc, ret) => {
//     // Create a new object in the desired field order
//     return {
//       serviceRequestId: ret.serviceRequestId,
//       quotationNo: ret.quotationNo,
//       industryDiv: ret.industryDiv,
//       zone: ret.zone,
//       equipmentSerialNo: ret.equipmentSerialNo,
//       modelNo: ret.modelNo,
//       customerName: ret.customerName,
//       billingPlant: ret.billingPlant,
//       salesUserOnBehalfOf: ret.salesUserOnBehalfOf,
//       createdBy: ret.createdBy,
//       remarks: ret.remarks,
//       attachments: ret.attachments,
//       status: ret.status,
//       registeredAt: ret.registeredAt,
//       allocatedTo: ret.allocatedTo,
//       allocatedBy: ret.allocatedBy,
//       allocatedAt: ret.allocatedAt,
//       approvedAt: ret.approvedAt,
//       releasedAt: ret.releasedAt,
//       rejectedAt: ret.rejectedAt,
//       lastUpdatedAt: ret.lastUpdatedAt,
//     };
//   },
// });

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
module.exports = ServiceRequest;
