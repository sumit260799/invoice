const express = require("express");
const ServiceRequest = require("../models/serviceRequestSchema.js");
const Counter = require("../models/counterModel.js");
const QuoteModel = require("../models/quotationModel.js");
const ChangeLog = require("../models/ChangeLogSchema.js");
const {
  QuotationAllocationLog,
  InvoiceAllocationLog,
} = require("../models/AllocationSchema.js");
const sendAllocationEmail = require("../middleware/allocationEmail.js");

const User = require("../models/UserModel.js");

const quoteCreate = async (req, res) => {
  const {
    quotationNo,
    createDate,
    releaseInd,
    releaseDate,
    approvalInd,
    approvalDate,
    rejectInd,
    rejectDate,
    billingDoc,
    invoiceDate,
    entryDate,
    changeDate,
  } = req.body;

  // Create a new instance of the model
  const newQuote = new QuoteModel({
    quotationNo,
    createDate,
    releaseInd,
    releaseDate,
    approvalInd,
    approvalDate,
    rejectInd,
    rejectDate,
    billingDoc,
    invoiceDate,
    entryDate,
    changeDate,
  });

  try {
    // Save the document to the database
    const savedQuote = await newQuote.save();
    res.status(201).json({
      message: "Quote created successfully",
      data: savedQuote,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create quote",
      error: error.message,
    });
  }
};

const getAllName = async (req, res) => {
  try {
    // Fetching users with role 'billingAgent' and selecting 'empName' and 'email'
    const allempData = await User.find({
      role: "billingAgent",
    }).select("-_id name email");

    // Mapping the data to include both empName and email in the response
    const empList = allempData.map((user) => ({
      name: user.name,
      email: user.email,
    }));

    res.status(200).json({ empList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const dummyUpdateServiceRequestStatus = async (req, res) => {
  try {
    // Fetch all service requests with status 'QuotationInprogress'

    const { serviceRequestId, quoteStatus } = req.query;

    const allocatedRequest = await ServiceRequest.findOne({
      serviceRequestId,
      billingProgressStatus: "QuotationInprogress",
    }).select("-_id -__v");

    if (!allocatedRequest) {
      return res.status(202).json({ message: `Not found!` });
    }

    // Check and update the status if it has changed in SAP

    if (allocatedRequest.quoteStatus === "ApprovalPending") {
      allocatedRequest.billingProgressStatus = "Pending";
      allocatedRequest.approvedAt = new Date();
      await allocatedRequest.save();
    } else if (allocatedRequest.quoteStatus === "PendingRelease") {
      allocatedRequest.billingProgressStatus = "InProgress";
      allocatedRequest.releasedAt = new Date();
      await allocatedRequest.save();
    } else if (allocatedRequest.quoteStatus === "Rejected") {
      allocatedRequest.billingProgressStatus = "InProgress";
      allocatedRequest.rejectedAt = new Date();
      await allocatedRequest.save();
    } else if (allocatedRequest.quoteStatus === "Billed") {
      allocatedRequest.billingProgressStatus = "Closed";
      allocatedRequest.billedAt = new Date();
      await allocatedRequest.save();
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error("Error:", error);
  }
};

const getQuotationAllocationLogs = async (req, res, next) => {
  try {
    const logs = await QuotationAllocationLog.find({ type: "Quotation" }).sort({
      createdAt: -1,
    });
    res.status(200).json({ logs });
  } catch (error) {
    next(error);
  }
};

const getInvoiceAllocationLogs = async (req, res, next) => {
  try {
    const logs = await InvoiceAllocationLog.find({ type: "Invoice" }).sort({
      createdAt: -1,
    });
    res.status(200).json({ logs });
  } catch (error) {
    next(error);
  }
};

//     // Validate Service Request ID
//     if (!serviceRequestId) {
//       return res
//         .status(400)
//         .json({ message: 'Service Request ID is required.' });
//     }

//     // Prepare the update fields dynamically
//     const updateFields = {
//       lastUpdatedAt: Date.now(), // Always update the timestamp
//     };

//     if (billingProgressStatus) {
//       // Validate billingProgressStatus only if provided
//       if (!['OnHold', 'Rejected'].includes(billingProgressStatus)) {
//         return res.status(400).json({
//           message: `Invalid billingProgressStatus. Allowed values are: OnHold, Rejected.`,
//         });
//       }
//       updateFields.billingProgressStatus = billingProgressStatus;
//     }

//     if (remarks) {
//       updateFields.remarks = remarks;
//     }

//     if (equipmentSerialNo) {
//       updateFields.equipmentSerialNo = equipmentSerialNo;
//     }

//     if (modelNo) {
//       updateFields.modelNo = modelNo;
//     }

//     // Update the ServiceRequest
//     const updatedSR = await ServiceRequest.findOneAndUpdate(
//       { serviceRequestId },
//       updateFields,
//       { new: true } // Return the updated document
//     );

//     if (!updatedSR) {
//       return res.status(404).json({
//         message: `Service Request ID ${serviceRequestId} not found.`,
//       });
//     }

//     // Log the change
//     await ChangeLog.create({
//       serviceRequestId,
//       actionType: billingProgressStatus,
//       remarks: remarks || '',
//     });

//     res.status(200).json({
//       message: `Service Request ${serviceRequestId} updated successfully.`,
//       updatedServiceRequest: updatedSR,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: `Error updating Service Request: ${error.message}` });
//   }
// };
const updateExistingSR = async (req, res) => {
  try {
    const { serviceRequestId, billingRqstStatus, remarks } = req.body; // Include remarks for logging purposes

    // Validate inputs
    if (!serviceRequestId) {
      return res
        .status(200)
        .json({ message: "Service Request ID is required." });
    }

    if (!remarks) {
      return res.status(200).json({ message: `Remarks required.` });
    }

    if (!billingRqstStatus) {
      return res
        .status(200)
        .json({ message: "Status (billingRqstStatus) is required." });
    } else {
      // Allowed statuses for manual updates
      if (!["OnHold", "Rejected"].includes(billingRqstStatus)) {
        return res.status(200).json({
          message: `Invalid billingRqstStatus. Allowed values are: OnHold, Rejected.`,
        });
      }

      // Update the ServiceRequest status
      const updatedSR = await ServiceRequest.findOneAndUpdate(
        { serviceRequestId },
        {
          // $set: {
          billingEditStatus: billingRqstStatus,
          lastUpdatedAt: Date.now(), // Update the timestamp
          remarks: remarks || "", // Optional field for logging manual changes
          // },
        },
        { new: true } // Return the updated document
      );

      await ChangeLog.findOneAndUpdate({
        serviceRequestId,
        changeType: billingRqstStatus,
        // previousStatus: serviceRequest.billingRqstStatus || 'None',
        newStatus: billingRqstStatus,
        // updatedBy,
        // actionType: billingRqstStatus,
        remarks: remarks,
      });

      if (!updatedSR) {
        return res.status(200).json({
          message: `Service Request ID ${serviceRequestId} not found.`,
        });
      }

      // Log the change for historical purposes
      // await saveStatusChangeLog(serviceRequestId, billingRqstStatus, remarks);

      res.status(201).json({
        message: `Service Request ${serviceRequestId} updated successfully.`,
        updatedServiceRequest: updatedSR,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error updating Service Request: ${error.message}` });
  }
};

// Helper function to save the status change log
// export const saveStatusChangeLog = async (serviceRequestId, newStatus, remarks) => {
//     try {
//         const logEntry = {
//             serviceRequestId,
//             newStatus,
//             remarks: remarks || 'No remarks provided',
//             updatedAt: new Date(),
//         };

//         // Assuming you have a StatusChangeLog collection
//         const StatusChangeLog = mongoose.model('StatusChangeLog', new mongoose.Schema({
//             serviceRequestId: String,
//             newStatus: String,
//             remarks: String,
//             updatedAt: Date,
//         }));

//         await StatusChangeLog.create(logEntry);
//     } catch (logError) {
//         console.error('Error saving status change log:', logError.message);
//     }
// };
const getALlocatedRequestsForSpc = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    const requests = await ServiceRequest.find({ allocatedTo_email: email });
    if (requests.length === 0) {
      return res
        .status(404)
        .json({ message: "No allocated requests found for this email." });
    }

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching allocated requests:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getAllQuotationNumbers = async (req, res) => {
  try {
    // Fetch all documents from QuoteModel and select only the 'quotationNo' field
    const quotationNumbers = await QuoteModel.find({}, "quotationNo");

    // Check if quotation numbers exist
    if (quotationNumbers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No quotation numbers found",
      });
    }

    // Add a check to see if each quotationNo exists in the ServiceRequest model
    const enhancedQuotationNumbers = await Promise.all(
      quotationNumbers.map(async (quote) => {
        const existsInServiceRequest = await ServiceRequest.exists({
          quotationNo: quote.quotationNo,
        });
        return {
          quotationNo: quote.quotationNo,
          quotationCreated: !!existsInServiceRequest, // true if exists, false otherwise
        };
      })
    );

    // Send the response with the fetched quotation numbers
    res.status(200).json({
      success: true,
      data: enhancedQuotationNumbers,
    });
  } catch (error) {
    // Handle errors
    console.error("Error fetching quotation numbers:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
const revokeBillingEditStatus = async (req, res) => {
  try {
    const { serviceRequestId } = req.body;

    // Validate input
    if (!serviceRequestId) {
      return res.status(400).json({ message: "ServiceRequestId is required." });
    }

    // Find the service request and update only the billingEditStatus
    const serviceRequest = await ServiceRequest.findOne({
      serviceRequestId,
    });

    if (!serviceRequest) {
      return res.status(404).json({ message: "Service request not found." });
    }

    if (
      serviceRequest.billingEditStatus === "OnHold" ||
      serviceRequest.billingEditStatus === "Rejected"
    ) {
      // Update only the billingEditStatus field
      await ServiceRequest.updateOne(
        { serviceRequestId },
        { billingEditStatus: "None" }
      );

      return res
        .status(200)
        .json({ message: "Billing status revoked successfully." });
    } else {
      return res.status(400).json({ message: "Cannot revoke this status." });
    }
  } catch (error) {
    console.error("Error revoking billing status:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getAllName,
  dummyUpdateServiceRequestStatus,
  quoteCreate,
  getQuotationAllocationLogs,
  // allocateForInvoice,
  getInvoiceAllocationLogs,
  updateExistingSR,
  getALlocatedRequestsForSpc,
  getAllQuotationNumbers,
  revokeBillingEditStatus,
};
