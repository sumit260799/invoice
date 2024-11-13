const mongoose = require('mongoose');

const quoteModel = new mongoose.Schema({
  quotationNo: {
    type: String,
  },
  createDate: {
    type: String,
  },
  releaseInd: {
    type: String,
  },
  releaseDate: {
    type: String,
  },
  approvalInd: {
    type: String,
  },
  approvalDate: {
    type: String,
  },
  rejectInd: {
    type: String,
  },
  rejectDate: {
    type: String,
  },
  billingDoc: {
    type: String,
  },
  invoiceDate: {
    type: String,
  },
  entryDate: {
    type: String,
  },
  changeDate: {
    type: String,
  },
});

const QuoteModel = mongoose.model('QuoteModel', quoteModel);
module.exports = QuoteModel;
