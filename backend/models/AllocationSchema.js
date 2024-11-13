const mongoose = require('mongoose');

// Quotation Allocation Log Schema
const quotationAllocationLogSchema = new mongoose.Schema({
  serviceRequestId: { type: String },
  action: {
    type: String,
    enum: ['AllocationforQuotation', 'ReallocationforQuotation'],
  },
  allocatedTo_name: { type: String },
  allocatedTo_email: { type: String },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Invoice Allocation Log Schema
const invoiceAllocationLogSchema = new mongoose.Schema({
  serviceRequestId: { type: String },
  action: {
    type: String,
    enum: ['AllocationforInvoice', 'ReallocationforInvoice'],
  },
  allocatedTo_name: { type: String },
  allocatedTo_email: { type: String },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Exporting models
module.exports = {
  QuotationAllocationLog: mongoose.model(
    'QuotationAllocationLog',
    quotationAllocationLogSchema
  ),
  InvoiceAllocationLog: mongoose.model(
    'InvoiceAllocationLog',
    invoiceAllocationLogSchema
  ),
};
