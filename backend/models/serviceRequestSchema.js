const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema({
  serviceRequestId: {
    type: String,
    unique: true,
    required: true,
  },
  quotationNo: {
    type: String,
  },
  quoteStatus: {
    type: String,
    enum: [
      "PendingRelease",
      "ApprovalPending",
      "BillingPending",
      "Rejected",
      "Billed",
    ],
  },
  industryDiv: {
    type: String,
    enum: ["BCP", "GCI", "SEM", "Mining"],
  },
  zone: {
    type: String,
    enum: [
      "Zone1",
      "Zone2",
      "Zone3",
      "Zone4",
      "Zone5",
      "Zone6",
      "Zone7",
      "Zone8",
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
    type: String,
    ref: "users",
  },
  remarks: {
    type: String,
  },
  files: {
    type: [String],
    default: [],
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  billingProgressStatus: {
    type: String,
    enum: [
      "PendingForQuotationAllocation",
      "QuotationInProgress",
      "PendingforInvoiceAllocation",
      "InvoicingInProgress",
      "Closed",
    ],
  },
  billingEditStatus: {
    type: String,
    enum: ["None", "OnHold", "Rejected"],
  },
  allocatedTo_name: {
    type: String,
  },
  allocatedTo_email: {
    type: String,
  },
  allocatedBy: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      default: null,
    },
  },
  allocatedAt: {
    type: Date,
  },
  reallocatedTo_name: {
    type: String,
  },
  reallocatedTo_email: {
    type: String,
  },
  reallocatedBy: {
    type: String,
  },
  reallocatedAt: {
    type: Date,
  },
  allocationHistory: {
    type: [
      {
        allocatedTo_name: String,
        allocatedTo_email: String,
        allocatedBy: String,
        allocatedAt: Date,
        reallocatedTo_name: String,
        reallocatedTo_email: String,
        reallocatedBy: String,
        reallocatedAt: Date,
      },
    ],
    default: [],
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
});

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);
module.exports = ServiceRequest;
