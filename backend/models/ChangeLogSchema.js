const mongoose = require('mongoose');

const changeLogSchema = new mongoose.Schema({
  serviceRequestId: {
    type: String,
    required: true,
    ref: 'ServiceRequest',
  },
  // previousStatus: {
  //     type: String,
  //     required: true,
  // },
  // newStatus: {
  //     type: String,
  //     required: true,
  // },
  updatedBy: {
    type: String,
    // required: true,
    ref: 'User',
  },
  actionType: {
    type: String,
    enum: [
      'OnHold',
      'Rejected',
      'AllocationforQuotation',
      'ReallocationforQuotation',
      'AllocationforInvoice',
      'ReallocationforInvoice',
    ],
    // required: true,
  },
  remarks: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ChangeLog = mongoose.model('ChangeLog', changeLogSchema);
module.exports = ChangeLog;
