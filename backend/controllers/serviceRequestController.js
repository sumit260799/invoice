const express = require("express");
const ServiceRequest = require("../models/serviceRequestSchema.js");
const Counter = require("../models/counterModel.js");
const QuoteModel = require("../models/quotationModel.js");
const ChangeLog = require("../models/ChangeLogSchema.js");
const {
  QuotationAllocationLog,
  InvoiceAllocationLog,
} = require("../models/AllocationSchema.js");
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
// Create service request
const createServiceRequest = async (req, res) => {
  try {
    const {
      quotationNo,
      industryDiv,
      zone,
      equipmentSerialNo,
      modelNo,
      customerName,
      billingPlant,
      salesUserOnBehalfOf,
      remarks,
      userId,
    } = req.body;
    console.log("🚀 ~ createServiceRequest ~ req.body:", req.body);

    // Retrieve uploaded file paths
    const filePaths = req.files.map((file) => file.filename);

    // Check if service request already exists for the provided quotation number
    const existingSR = await ServiceRequest.findOne({ quotationNo });
    if (existingSR) {
      return res.status(400).json({
        message: `Service request is already registered against Quotation No. ${quotationNo}`,
      });
    }

    // Retrieve the existing quotation for the given quotation number
    const existingQuotation = await QuoteModel.findOne({ quotationNo });
    if (!existingQuotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (!existingQuotation || !existingQuotation.createDate) {
      res.status(200).json({
        message: `${quotationNo} does not exist!`,
      });
    } else if (existingQuotation.createDate && !existingQuotation.billingDoc) {
      const getNextServiceRequestId = async () => {
        const counter = await Counter.findOneAndUpdate(
          { name: "SR" },
          { $inc: { value: 1 } },
          { new: true, upsert: true }
        );

        const paddedValue = String(counter.value).padStart(8, "0");
        const sr = counter.name + paddedValue;
        return sr;
      };

      const serviceRequestId = await getNextServiceRequestId();

      if (!existingQuotation.releaseInd) {
        // Create a new service request object
        // if (!existingQuotation.releaseInd && !existingQuotation.approvalInd && !existingQuotation.rejectInd) {
        const serviceRequest = new ServiceRequest({
          serviceRequestId,
          quotationNo,
          industryDiv,
          zone,
          equipmentSerialNo,
          modelNo,
          customerName,
          billingPlant,
          salesUserOnBehalfOf,
          // createdBy: req.user._id, // Assuming req.user contains the authenticated user
          remarks,
          files: filePaths,
          // quoteStatus,
          createdBy: userId,
          billingProgressStatus: "PendingForQuotationAllocation",
        });

        const changelogs = new ChangeLog({
          serviceRequestId,
        });

        // Save the service request to the database
        await serviceRequest.save();
        await changelogs.save();
        // }

        // else if (existingQuotation.createDate && existingQuotation.billingDoc) {

        // }

        // Send a response
        res.status(201).json({
          message: `${serviceRequestId} created`,
          serviceRequest,
        });
      } else if (
        existingQuotation.releaseInd &&
        !existingQuotation.approvalInd
      ) {
        const serviceRequest = new ServiceRequest({
          serviceRequestId,
          quotationNo,
          industryDiv,
          zone,
          equipmentSerialNo,
          modelNo,
          customerName,
          billingPlant,
          salesUserOnBehalfOf,
          createdBy: userId,
          remarks,
          files: filePaths,
          // quoteStatus,
          billingProgressStatus: "PendingForQuotationAllocation",
        });

        await serviceRequest.save();
        res
          .status(201)
          .json({ message: `${serviceRequestId} created`, serviceRequest });
      } else if (
        existingQuotation.approvalInd &&
        !existingQuotation.billingDoc
      ) {
        const serviceRequest = new ServiceRequest({
          serviceRequestId,
          quotationNo,
          industryDiv,
          zone,
          equipmentSerialNo,
          modelNo,
          customerName,
          billingPlant,
          salesUserOnBehalfOf,
          createdBy: userId,
          remarks,
          files: filePaths,
          // quoteStatus,
          billingProgressStatus: "PendingforInvoiceAllocation",
        });

        // Save the service request to the database
        await serviceRequest.save();
        // Send a response
        res.status(201).json({
          message: `${serviceRequestId} created`,
          serviceRequest,
        });
      }
    } else if (existingQuotation.billingDoc) {
      res.status(201).json({
        message: `${existingQuotation.quotationNo} is already billed!`,
      });
    } else {
      const resMsg = res.status(201).json({ message: `Not found!` });
      return resMsg;
    }
  } catch (error) {
    console.error("Error creating service request:", error);
    res.status(500).json({ message: error.message });
  }
};
const getServiceRequest = async (req, res) => {
  try {
    const { serviceRequestId } = req.query;

    if (!serviceRequestId) {
      return res
        .status(400)
        .json({ message: "Service Request ID is required!" });
    }

    const serviceRequest = await ServiceRequest.findOne({
      serviceRequestId,
    }).select("-_id -__v");

    if (!serviceRequest) {
      return res
        .status(404)
        .json({ message: `Service Request ID ${serviceRequestId} not found!` });
    }

    const displayReport = serviceRequest.toObject();

    res.status(200).json({ displayReport });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getServiceRequestByStatus = async (req, res) => {
  try {
    const { billingProgressStatus, quoteStatus } = req.query; // Destructure both billingProgressStatus and quoteStatus from the query

    // Build the filter object dynamically based on available query parameters
    const filter = {};
    if (billingProgressStatus)
      filter.billingProgressStatus = billingProgressStatus;
    if (quoteStatus) filter.quoteStatus = quoteStatus;

    // Find service requests based on the filter
    const serviceRequests = await ServiceRequest.find(filter).select(
      "-_id -__v"
    );

    if (!serviceRequests || serviceRequests.length === 0) {
      return res.status(404).json({
        message: `No service requests found with specified status(es).`,
      });
    }

    res.status(200).json({ serviceRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllServiceRequest = async (req, res) => {
  try {
    // Fetch all service requests from the database
    const serviceRequests = await ServiceRequest.find();

    // Check if there are any service requests
    if (serviceRequests.length === 0) {
      return res.status(404).json({ message: "No service requests found." });
    }

    // Send the service requests in the response
    res.status(200).json({ serviceRequests });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: error.message });
  }
};
const allocateServiceRequest = async (req, res) => {
  // try {
  //   const { name, email, serviceRequestId, action, allocatedBy } = req.body;
  //   const serviceRequest = await ServiceRequest.findOne({ serviceRequestId });
  //   const user = await AdminCreateUser.findOne({
  //     name,
  //     email,
  //     role: 'billingAgent',
  //   });
  //   if (!user) {
  //     return res.status(404).json({ message: `${name} not found!` });
  //   }
  //   // Ensure the quote status is eligible
  //   if (
  //     (serviceRequest.quoteStatus == 'BillingPending' &&
  //       serviceRequest.quoteStatus == 'Billed') ||
  //     (serviceRequest.billingProgressStatus == 'PendingforInvoiceAllocation' &&
  //       serviceRequest.billingProgressStatus == 'InvoicingInProgress')
  //   ) {
  //     return res.status(400).json({
  //       message: `Cannot ${action.toLowerCase()} for quoteStatus: ${
  //         serviceRequest.quoteStatus
  //       }`,
  //     });
  //   }
  //   // Update Service Request
  //   if (action === 'AllocationforQuotation') {
  //     serviceRequest.allocatedTo_name = name;
  //     serviceRequest.allocatedTo_email = email;
  //     serviceRequest.billingProgressStatus = 'QuotationInProgress';
  //     serviceRequest.allocatedAt = new Date();
  //   } else if (action === 'ReallocationforQuotation') {
  //     serviceRequest.reallocatedTo_name = name;
  //     serviceRequest.reallocatedTo_email = email;
  //     serviceRequest.billingProgressStatus = 'QuotationInProgress';
  //     serviceRequest.reallocatedAt = new Date();
  //   }
  //   await serviceRequest.save();
  //   // Log the action
  //   const logEntry = new QuotationAllocationLog({
  //     serviceRequestId,
  //     // type,
  //     action,
  //     allocatedTo_name: name,
  //     allocatedTo_email: email,
  //     remarks,
  //   });
  //   await logEntry.save();
  //   // }
  //   res.status(200).json({
  //     message: `Service Request ${serviceRequestId} allocated successfully for quotation.`,
  //     logEntry,
  //   });
  // } catch (error) {
  //   next();
  // }
};

const getServiceRequestbyEmail = async (req, res) => {
  try {
    const { allocatedTo } = req.query;

    const serviceRequest = await ServiceRequest.find({
      allocatedTo,
      role: "billingAgent",
    }).select("-_id -__v");

    if (!serviceRequest) {
      return res.status(202).json({ message: `Not found!` });
    }

    // const getReport = serviceRequest.toObject();

    res.status(200).json({ serviceRequest });

    // res.status(200).json({ getReport });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
const allocateForQuotation = async (req, res, next) => {
  // try {
  //   const { serviceRequestId, name, email, remarks, action, allocatedBy } =
  //     req.body;
  //   // Find the service request
  //   const serviceRequest = await ServiceRequest.findOne({ serviceRequestId });
  //   if (!serviceRequest) {
  //     return res
  //       .status(404)
  //       .json({ message: `Service Request ${serviceRequestId} not found!` });
  //   }
  //   const user = await AdminCreateUser.findOne({
  //     name,
  //     email,
  //     role: "billingAgent",
  //   });
  //   if (!user) {
  //     return res.status(202).json({ message: `${name} not found!` });
  //   }
  //   if (
  //     serviceRequest.quoteStatus == "PendingRelease" ||
  //     serviceRequest.quoteStatus == "ApprovalPending" ||
  //     (serviceRequest.billingProgressStatus ==
  //       "PendingForQuotationAllocation" &&
  //       serviceRequest.billingProgressStatus == "QuotationInProgress")
  //   ) {
  //     // return res.status(400).json({
  //     //   message: `Cannot ${action.toLowerCase()} for quoteStatus: ${
  //     //     serviceRequest.quoteStatus
  //     //   }`,
  //     // });
  //     // Update Service Request
  //     if (action === "AllocationforQuotation") {
  //       serviceRequest.allocatedTo_name = name;
  //       serviceRequest.allocatedTo_email = email;
  //       serviceRequest.billingProgressStatus = "QuotationInProgress";
  //       serviceRequest.allocatedAt = new Date();
  //     } else if (action === "ReallocationforQuotation") {
  //       serviceRequest.reallocatedTo_name = name;
  //       serviceRequest.reallocatedTo_email = email;
  //       serviceRequest.billingProgressStatus = "QuotationInProgress";
  //       serviceRequest.reallocatedAt = new Date();
  //     }
  //     await serviceRequest.save();
  //     // Log the action
  //     const QuotationlogEntry = new QuotationAllocationLog({
  //       serviceRequestId,
  //       // type,
  //       action,
  //       allocatedTo_name: name,
  //       allocatedTo_email: email,
  //       remarks,
  //     });
  //     await QuotationlogEntry.save();
  //     // }
  //     res.status(200).json({
  //       message: `Service Request ${serviceRequestId} allocated successfully for quotation.`,
  //       QuotationlogEntry,
  //     });
  //   }
  //   if (
  //     serviceRequest.quoteStatus == "BillingPending" && //serviceRequest.quoteStatus == 'Billed' ||
  //     (serviceRequest.billingProgressStatus == "PendingforInvoiceAllocation" ||
  //       serviceRequest.billingProgressStatus == "InvoicingInProgress")
  //   ) {
  //     // return res.status(400).json({
  //     //   message: `Cannot ${action.toLowerCase()} for quoteStatus: ${
  //     //     serviceRequest.quoteStatus
  //     //   }`,
  //     // });
  //     // Update Service Request
  //     if (action === "AllocationforInvoice") {
  //       serviceRequest.allocatedTo_name = name;
  //       serviceRequest.allocatedTo_email = email;
  //       serviceRequest.billingProgressStatus = "InvoicingInProgress";
  //       serviceRequest.allocatedAt = new Date();
  //     } else if (action === "ReallocationforInvoice") {
  //       serviceRequest.reallocatedTo_name = name;
  //       serviceRequest.reallocatedTo_email = email;
  //       serviceRequest.billingProgressStatus = "InvoicingInProgress";
  //       serviceRequest.reallocatedAt = new Date();
  //     }
  //     await serviceRequest.save();
  //     // Log the action
  //     const InvoicelogEntry = new InvoiceAllocationLog({
  //       serviceRequestId,
  //       type,
  //       action,
  //       allocatedTo_name,
  //       allocatedTo_email,
  //       remarks,
  //     });
  //     await InvoicelogEntry.save();
  //     res.status(200).json({
  //       message: `Service Request ${serviceRequestId} allocated successfully for invoice.`,
  //       InvoicelogEntry,
  //     });
  //   }
  // } catch (error) {
  //   next(error);
  // }
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
const updateServiceRequestStatus = async (req, res) => {
  try {
    // Fetch all service requests with status 'Allocated'
    const allocatedRequests = await ServiceRequest.find({
      billingProgressStatus: "Allocated",
    });

    for (const request of allocatedRequests) {
      // Fetch the current status from SAP OData
      const allocatedRequest = await allocateServiceRequest(
        request.serviceRequestId
      );

      if (!allocatedRequest) continue; // Skip if unable to fetch from SAP

      // Check and update the status if it has changed in SAP

      if (
        allocatedRequest.quoteStatus === "PendingRelease" &&
        request.quoteStatus === "PendingRelease"
      ) {
        request.billingProgressStatus = "PendingforReallocation";
        request.approvedAt = new Date();
      } else if (
        allocatedRequest.quoteStatus === "ApprovalPending" &&
        request.quoteStatus === "ApprovalPending"
      ) {
        request.billingProgressStatus = "InProgress";
        request.releasedAt = new Date();
      } else if (
        allocatedRequest.quoteStatus === "Rejected" &&
        request.quoteStatus === "Rejected"
      ) {
        request.billingProgressStatus = "ReallocatedforInvoice";
        request.rejectedAt = new Date();
      } else if (
        allocatedRequest.quoteStatus === "Billed" &&
        request.quoteStatus === "Billed"
      ) {
        request.billingProgressStatus = "Closed";
        request.billedAt = new Date();
      }

      // Save only if the status was updated
      if (request.isModified("billingProgressStatus")) {
        await request.save();
      }
    }
  } catch (error) {
    console.error("Error updating service request statuses:", error);
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
    const { serviceRequestId } = req.body; // Extract serviceRequestId directly
    const srId = serviceRequestId.serviceRequestId;
    const serviceRequest = await ServiceRequest.findOne({
      serviceRequestId: srId,
    });

    if (!serviceRequest) {
      return res.status(404).json({ message: "Service request not found." });
    }

    if (
      serviceRequest.billingEditStatus === "OnHold" ||
      serviceRequest.billingEditStatus === "Rejected"
    ) {
      serviceRequest.billingEditStatus = "None"; // Clear the status
      await serviceRequest.save();
      return res
        .status(200)
        .json({ message: "Billing status revoked successfully." });
    } else {
      return res.status(400).json({ message: "Cannot revoke this status." });
    }
  } catch (error) {
    console.error("Error revoking billing status:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
module.exports = {
  createServiceRequest,
  getServiceRequest,
  getServiceRequestByStatus,
  getAllServiceRequest,
  allocateServiceRequest,
  getServiceRequestbyEmail,
  getAllName,
  dummyUpdateServiceRequestStatus,
  quoteCreate,
  allocateForQuotation,
  getQuotationAllocationLogs,
  // allocateForInvoice,
  getInvoiceAllocationLogs,
  updateServiceRequestStatus,
  updateExistingSR,
  getALlocatedRequestsForSpc,
  getAllQuotationNumbers,
  revokeBillingEditStatus,
};
