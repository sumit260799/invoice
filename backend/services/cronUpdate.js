const cron = require('node-cron');
const ServiceRequest = require('../models/serviceRequestSchema.js');
const QuoteModel = require('../models/quotationModel.js');

const updateServiceRequestStatus = async () => {
  try {
    // Fetch all service requests
    const serviceRequests = await ServiceRequest.find();

    const quotation = await QuoteModel.find();

    console.log(quotation);

    for (const serviceRequest of serviceRequests) {
      const quote = await QuoteModel.findOne({
        quotationNo: serviceRequest.quotationNo,
      });

      if (!quote) {
        console.log(
          `No quote found for QuotationNo: ${serviceRequest.quotationNo}`
        );
        continue;
      }

      let newStatus = serviceRequest.quoteStatus;
      let newSRStatus = serviceRequest.srStatus;

      // Determine new status based on indicators in QuoteModel
      if (quote.createDate && !quote.releaseInd && !quote.billingDoc) {
        newStatus = 'PendingRelease';
        newSRStatus = 'PendingForQuotationAllocation';
      }
      if (quote.releaseInd) {
        newStatus = 'ApprovalPending';
        newSRStatus = '';
      }
      if (quote.approvalInd) {
        newStatus = 'BillingPending';
        newSRStatus = 'PendingforInvoiceAllocation';
      }
      if (quote.rejectInd) {
        newStatus = 'Rejected';
        newSRStatus = 'PendingForQuotationAllocation';
      }
      if (quote.billingDoc) {
        newStatus = 'Billed';
        newSRStatus = 'Closed';
      }

      // Update the service request only if the status has changed
      if (serviceRequest.quoteStatus !== newStatus) {
        await ServiceRequest.updateOne(
          { serviceRequestId: serviceRequest.serviceRequestId },
          {
            quoteStatus: newStatus,
            srStatus: newSRStatus,
            lastUpdatedAt: Date.now(),
          }
        );
        console.log(
          `Updated ServiceRequest ${serviceRequest.serviceRequestId} to ${newStatus}`
        );
      }
    }
  } catch (error) {
    console.error('Error updating service request status:', error.message);
  }
};

// Schedule the cron job to run every minute
cron.schedule('* * * * *', async () => {
  console.log(
    'Running cron job: Checking and updating ServiceRequest statuses...'
  );
  await updateServiceRequestStatus();
});

module.exports = updateServiceRequestStatus;
