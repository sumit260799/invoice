const ServiceRequest = require('../models/serviceRequestSchema.js');
const QuoteModel = require('../models/quotationModel.js');

/**
 * Updates the quote status in the related ServiceRequest based on indicators in quoteModel
 * @param {String} quoteNo - The quote number in quoteModel to update the related ServiceRequest
 */
// export const updateQuoteStatusInServiceRequest = async (quoteNo) => {
//     try {
//         // Fetch the quote by quoteNo
//         const quote = await QuoteModel.findOne({ quoteNo });

//         if (!quote) throw new Error(`Quote with quoteNo ${quoteNo} not found`);

//         // Determine the new status based on the indicators
//         let newStatus;// Default status
//         if (quote.createDate || !quote.billingDoc) newStatus = 'Created'
//         if (quote.approvalInd) newStatus = 'X';
//         else if (quote.releaseInd) newStatus = 'X';
//         else if (quote.rejectInd) newStatus = 'X';
//         else if (quote.billingDoc) newStatus = 'Billed';

//         // Update the ServiceRequest with the new status
//         const result = await ServiceRequest.updateOne(
//             { quotationNo: quote.quoteNo },
//             { srStatus: 'PendingForQuotationAllocation', lastUpdatedAt: Date.now() }
//         );

//         if (result.nModified > 0) {
//             console.log(`ServiceRequest with quotationNo ${quoteNo} updated to status: ${newStatus}`);
//         } else {
//             console.log(`No ServiceRequest found with quotationNo ${quoteNo} to update.`);
//         }
//     } catch (error) {
//         console.error(`Error updating ServiceRequest for quoteNo ${quoteNo}:`, error);
//         throw error; // Re-throw error for further handling if needed
//     }
// };

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
      // console.log(serviceRequest);

      if (!quote) {
        console.log(
          `No quote found for QuotationNo: ${serviceRequest.quotationNo}`
        );
        continue;
      }

      let newStatus = serviceRequest.quoteStatus;
      let newbillingProgressStatus = serviceRequest.billingProgressStatus;
      let editStatus = serviceRequest.billingEditStatus;

      // Determine new status based on indicators in QuoteModel
      if (
        quote.createDate &&
        !quote.releaseInd &&
        !quote.approvalInd &&
        !quote.billingDoc
      ) {
        newStatus = 'PendingRelease';
        console.log(newStatus);
        console.log(
          `For Pending Release`,
          serviceRequest.billingProgressStatus
        );
        newbillingProgressStatus = serviceRequest.billingProgressStatus;
        console.log(newbillingProgressStatus);
        if (
          !(
            (serviceRequest.billingEditStatus === 'OnHold' ||
              serviceRequest.billingEditStatus === 'Rejected') &&
            serviceRequest.billingProgressStatus === 'QuotationInProgress'
          ) ||
          serviceRequest.billingProgressStatus === 'QuotationInProgress'
        ) {
          newbillingProgressStatus = 'PendingForQuotationAllocation';
          console.log(`Executing if`, newbillingProgressStatus);
        } else if (
          (serviceRequest.billingEditStatus === 'OnHold' ||
            serviceRequest.billingEditStatus === 'Rejected') &&
          serviceRequest.billingProgressStatus === 'QuotationInProgress'
        ) {
          newbillingProgressStatus;
          console.log(`Executing if OnHold/Reject`, newbillingProgressStatus);
        }
        await ServiceRequest.updateOne(
          { serviceRequestId: serviceRequest.serviceRequestId },
          {
            quoteStatus: newStatus,
            billingProgressStatus: newbillingProgressStatus,
            lastUpdatedAt: Date.now(),
          }
        );
        console.log(
          `For Pending Release newbillingProgressStatus`,
          newbillingProgressStatus
        );
      } else if (
        quote.releaseInd &&
        (!quote.approvalInd ||
          quote.approvalInd === 'X' ||
          quote.approvalInd === 'XX' ||
          !quote.approvalInd === 'XXX') &&
        !quote.rejectInd
      ) {
        newStatus = 'ApprovalPending';
        console.log(
          `For Pending Approval`,
          serviceRequest.billingProgressStatus
        );
        // newbillingProgressStatus = '';
        await ServiceRequest.updateOne(
          { serviceRequestId: serviceRequest.serviceRequestId },
          {
            quoteStatus: newStatus,
            billingProgressStatus: newbillingProgressStatus,
            lastUpdatedAt: Date.now(),
          }
        );
      } else if (
        quote.releaseInd &&
        quote.approvalInd === 'XXX' &&
        !quote.billingDoc
      ) {
        newStatus = 'BillingPending';
        console.log(
          `For Pending Billing`,
          serviceRequest.billingProgressStatus
        );
        newbillingProgressStatus = serviceRequest.billingProgressStatus;
        console.log(newbillingProgressStatus);
        if (
          !(
            (serviceRequest.billingEditStatus === 'OnHold' ||
              serviceRequest.billingEditStatus === 'Rejected') &&
            serviceRequest.billingProgressStatus === 'InvoicingInProgress'
          ) ||
          serviceRequest.billingProgressStatus === 'InvoicingInProgress'
        ) {
          newbillingProgressStatus = 'PendingforInvoiceAllocation';
          console.log(`Executing if`, newbillingProgressStatus);
        } else if (
          (serviceRequest.billingEditStatus === 'OnHold' ||
            serviceRequest.billingEditStatus === 'Rejected') &&
          serviceRequest.billingProgressStatus === 'InvoicingInProgress'
        ) {
          newbillingProgressStatus;
          console.log(`Executing if OnHold/Reject`, newbillingProgressStatus);
        }
        console.log(
          `For Pending Billing newbillingProgressStatus`,
          newbillingProgressStatus
        );
        await ServiceRequest.updateOne(
          { serviceRequestId: serviceRequest.serviceRequestId },
          {
            quoteStatus: newStatus,
            billingProgressStatus: newbillingProgressStatus,
            lastUpdatedAt: Date.now(),
          }
        );
      } else if (quote.rejectInd) {
        newStatus = 'Rejected';
        console.log(`For Rejected`, serviceRequest.billingProgressStatus);
        newbillingProgressStatus = serviceRequest.billingProgressStatus;
        console.log(newbillingProgressStatus);
        if (
          !(
            serviceRequest.billingEditStatus === 'OnHold' ||
            serviceRequest.billingEditStatus === 'Rejected'
          )
        ) {
          newbillingProgressStatus = 'PendingForQuotationAllocation';
        } else if (
          serviceRequest.billingEditStatus === 'OnHold' ||
          serviceRequest.billingEditStatus === 'Rejected'
        ) {
          newbillingProgressStatus;
          console.log(`Executing if OnHold/Reject`, newbillingProgressStatus);
        }
        console.log(
          `For Rejected newbillingProgressStatus`,
          newbillingProgressStatus
        );
        await ServiceRequest.updateOne(
          { serviceRequestId: serviceRequest.serviceRequestId },
          {
            quoteStatus: newStatus,
            billingProgressStatus: newbillingProgressStatus,
            lastUpdatedAt: Date.now(),
          }
        );
      } else if (quote.billingDoc) {
        newStatus = 'Billed';
        if (
          !(
            serviceRequest.billingEditStatus === 'OnHold' ||
            serviceRequest.billingEditStatus === 'Rejected'
          )
        ) {
          newbillingProgressStatus = 'Closed';
        } else if (
          serviceRequest.billingEditStatus === 'OnHold' ||
          serviceRequest.billingEditStatus === 'Rejected'
        ) {
          newbillingProgressStatus;
          console.log(`Executing if OnHold/Reject`, newbillingProgressStatus);
        }
        await ServiceRequest.updateOne(
          { serviceRequestId: serviceRequest.serviceRequestId },
          {
            quoteStatus: newStatus,
            billingProgressStatus: newbillingProgressStatus,
            lastUpdatedAt: Date.now(),
          }
        );
      }

      console.log(`newbillingProgressStatus`, newbillingProgressStatus);

      // Update the service request only if the status has changed
      // if (serviceRequest.quoteStatus !== newStatus) {
      //     await ServiceRequest.updateOne(
      //         { serviceRequestId: serviceRequest.serviceRequestId },
      //         {
      //             quoteStatus: newStatus,
      //             billingProgressStatus: newbillingProgressStatus,
      //             lastUpdatedAt: Date.now()
      //         }
      //     );
      //     console.log(`Updated ServiceRequest ${serviceRequest.serviceRequestId} to ${newStatus}`);
      //     console.log(`updated SR: ${serviceRequest.billingProgressStatus}`);
      //     console.log(`newbillingProgressStatus after updating`, newbillingProgressStatus);
      // }
    }
  } catch (error) {
    console.error('Error updating service request status:', error.message);
  }
};
module.exports = updateServiceRequestStatus;
