const express = require('express');
const ServiceRequest = require('../models/serviceRequestSchema.js');
const Counter = require('../models/counterModel.js');
const AdminCreateUser = require('../models/AdminCreateUser.js');
const QuoteModel = require('../models/quotationModel.js');
const {
  QuotationAllocationLog,
  InvoiceAllocationLog,
} = require('../models/AllocationSchema.js');

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
      message: 'Quote created successfully',
      data: savedQuote,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create quote',
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
    } = req.body;

    // Retrieve uploaded file paths
    const filePaths = req.files.map(file => file.filename);

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
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // Check conditions for billing document
    if (existingQuotation.createDate && !existingQuotation.billingDoc) {
      // Generate new service request ID
      const getNextServiceRequestId = async () => {
        const counter = await Counter.findOneAndUpdate(
          { name: 'SR' },
          { $inc: { value: 1 } },
          { new: true, upsert: true }
        );
        const paddedValue = String(counter.value).padStart(8, '0');
        return counter.name + paddedValue;
      };

      const serviceRequestId = await getNextServiceRequestId();

      // Set service request status based on approval indicator
      const srStatus = existingQuotation.approvalInd
        ? 'PendingforInvoiceAllocation'
        : 'PendingForQuotationAllocation';

      // Prepare new service request data
      const serviceRequestData = {
        serviceRequestId,
        quotationNo,
        industryDiv,
        zone,
        equipmentSerialNo,
        modelNo,
        customerName,
        billingPlant,
        salesUserOnBehalfOf,
        remarks,
        files: filePaths,
        srStatus,
      };

      // Create and save the service request
      const serviceRequest = new ServiceRequest(serviceRequestData);
      await serviceRequest.save();

      return res.status(201).json({
        message: `${serviceRequestId} created`,
        serviceRequest,
      });
    } else if (existingQuotation.billingDoc) {
      return res
        .status(400)
        .json({ message: `${quotationNo} is already billed!` });
    } else {
      return res.status(400).json({ message: 'No matching conditions found' });
    }
  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({ message: error.message });
  }
};
const getServiceRequest = async (req, res) => {
  try {
    const { serviceRequestId } = req.query;

    const serviceRequest = await ServiceRequest.findOne({
      serviceRequestId,
    }).select('-_id -__v');

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
    const { srStatus, quoteStatus } = req.query; // Destructure both srStatus and quoteStatus from the query

    // Build the filter object dynamically based on available query parameters
    const filter = {};
    if (srStatus) filter.srStatus = srStatus;
    if (quoteStatus) filter.quoteStatus = quoteStatus;

    // Find service requests based on the filter
    const serviceRequests = await ServiceRequest.find(filter).select(
      '-_id -__v'
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
      return res.status(404).json({ message: 'No service requests found.' });
    }

    // Send the service requests in the response
    res.status(200).json({ serviceRequests });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: error.message });
  }
};
const allocateServiceRequest = async (req, res) => {
  try {
    const { name, email, serviceRequestId, action, srStatus } = req.body;
    const serviceRequest = await ServiceRequest.findOne({ serviceRequestId });
    const user = await AdminCreateUser.findOne({ name, email, role: 'spc' });

    if (!user) {
      return res.status(404).json({ message: `${name} not found!` });
    }

    // Ensure the quote status is eligible
    if (
      (serviceRequest.quoteStatus == 'BillingPending' &&
        serviceRequest.quoteStatus == 'Billed') ||
      (serviceRequest.srStatus == 'PendingforInvoiceAllocation' &&
        serviceRequest.srStatus == 'InvoicingInProgress')
    ) {
      return res.status(400).json({
        message: `Cannot ${action.toLowerCase()} for quoteStatus: ${
          serviceRequest.quoteStatus
        }`,
      });
    }

    // Update Service Request
    if (action === 'AllocationforQuotation') {
      serviceRequest.allocatedTo_name = name;
      serviceRequest.allocatedTo_email = email;
      serviceRequest.srStatus = 'QuotationInProgress';
      serviceRequest.allocatedAt = new Date();
    } else if (action === 'ReallocationforQuotation') {
      serviceRequest.reallocatedTo_name = name;
      serviceRequest.reallocatedTo_email = email;
      serviceRequest.srStatus = 'QuotationInProgress';
      serviceRequest.reallocatedAt = new Date();
    }
    await serviceRequest.save();

    // Log the action
    const logEntry = new QuotationAllocationLog({
      serviceRequestId,
      // type,
      action,
      allocatedTo_name: name,
      allocatedTo_email: email,
      remarks,
    });
    await logEntry.save();

    // }

    res.status(200).json({
      message: `Service Request ${serviceRequestId} allocated successfully for quotation.`,
      logEntry,
    });
  } catch (error) {
    next();
  }
};

const getServiceRequestbyEmail = async (req, res) => {
  try {
    const { allocatedTo } = req.query;

    const serviceRequest = await ServiceRequest.find({
      allocatedTo,
      role: 'spc',
    }).select('-_id -__v');

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
    // Fetching users with role 'spc' and selecting 'empName' and 'email'
    const allempData = await AdminCreateUser.find({ role: 'spc' }).select(
      '-_id name email'
    );

    // Mapping the data to include both empName and email in the response
    const empList = allempData.map(user => ({
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
      srStatus: 'QuotationInprogress',
    }).select('-_id -__v');

    if (!allocatedRequest) {
      return res.status(202).json({ message: `Not found!` });
    }

    console.log(`Allocated request: ${allocatedRequest}`);

    // for (const request of allocatedRequests) {
    //     // Fetch the current status from SAP OData
    //     const allocatedRequest = await getServiceRequest(serviceRequestId);

    //     console.log(`tuhuu8${allocatedRequest}`);

    // console.log(`SAP Status for ServiceRequest ${request.serviceRequestId}: ${allocatedRequest}`);

    // if (!allocatedRequest) continue; // Skip if unable to fetch from SAP

    // Check and update the status if it has changed in SAP

    if (allocatedRequest.quoteStatus === 'ApprovalPending') {
      allocatedRequest.srStatus = 'Pending';
      allocatedRequest.approvedAt = new Date();
      await allocatedRequest.save();
      console.log(`Approved Request: ${allocatedRequest}`);
    } else if (allocatedRequest.quoteStatus === 'PendingRelease') {
      allocatedRequest.srStatus = 'InProgress';
      allocatedRequest.releasedAt = new Date();
      await allocatedRequest.save();
    } else if (allocatedRequest.quoteStatus === 'Rejected') {
      allocatedRequest.srStatus = 'InProgress';
      allocatedRequest.rejectedAt = new Date();
      await allocatedRequest.save();
    } else if (allocatedRequest.quoteStatus === 'Billed') {
      allocatedRequest.srStatus = 'Closed';
      allocatedRequest.billedAt = new Date();
      await allocatedRequest.save();
    }

    // Save only if the status was updated
    // if (allocatedRequest.isModified('srStatus')) {
    //     await allocatedRequest.save();
    //     console.log(`${allocatedRequest.serviceRequestId} updated to status ${allocatedRequest}.`);
    // }
    // }
    console.log(
      `Daily SAP status update completed successfully. ${allocatedRequest}`
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error('Error:', error);
  }
};
const allocateForQuotation = async (req, res, next) => {
  try {
    const { serviceRequestId, name, email, remarks, action } = req.body;
    console.log('🚀 ~ allocateForQuotation ~ req.body:', req.body);
    // Find the service request
    const serviceRequest = await ServiceRequest.findOne({ serviceRequestId });
    if (!serviceRequest) {
      return res
        .status(404)
        .json({ message: `Service Request ${serviceRequestId} not found!` });
    }

    const user = await AdminCreateUser.findOne({ name, email, role: 'spc' });

    if (!user) {
      return res.status(202).json({ message: `${name} not found!` });
    }

    // Ensure the quote status is eligible
    // if (
    //   (serviceRequest.quoteStatus == 'BillingPending' &&
    //     serviceRequest.quoteStatus == 'Billed') ||
    //   (serviceRequest.srStatus == 'PendingforInvoiceAllocation' &&
    //     serviceRequest.srStatus == 'InvoicingInProgress')
    // ) {
    //   return res.status(400).json({
    //     message: `Cannot ${action.toLowerCase()} for quoteStatus: ${
    //       serviceRequest.quoteStatus
    //     }`,
    //   });
    // }

    if (
      serviceRequest.quoteStatus == 'PendingRelease' ||
      serviceRequest.quoteStatus == 'ApprovalPending' ||
      (serviceRequest.srStatus == 'PendingForQuotationAllocation' &&
        serviceRequest.srStatus == 'QuotationInProgress')
    ) {
      // return res.status(400).json({
      //   message: `Cannot ${action.toLowerCase()} for quoteStatus: ${
      //     serviceRequest.quoteStatus
      //   }`,
      // });

      // Update Service Request
      if (action === 'AllocationforQuotation') {
        serviceRequest.allocatedTo_name = name;
        serviceRequest.allocatedTo_email = email;
        serviceRequest.srStatus = 'QuotationInProgress';
        serviceRequest.allocatedAt = new Date();
      } else if (action === 'ReallocationforQuotation') {
        serviceRequest.reallocatedTo_name = name;
        serviceRequest.reallocatedTo_email = email;
        serviceRequest.srStatus = 'QuotationInProgress';
        serviceRequest.reallocatedAt = new Date();
      }
      await serviceRequest.save();

      // Log the action
      const QuotationlogEntry = new QuotationAllocationLog({
        serviceRequestId,
        // type,
        action,
        allocatedTo_name: name,
        allocatedTo_email: email,
        remarks,
      });
      await QuotationlogEntry.save();

      // }

      res.status(200).json({
        message: `Service Request ${serviceRequestId} allocated successfully for quotation.`,
        QuotationlogEntry,
      });
    }

    if (
      serviceRequest.quoteStatus == 'BillingPending' && //serviceRequest.quoteStatus == 'Billed' ||
      (serviceRequest.srStatus == 'PendingforInvoiceAllocation' ||
        serviceRequest.srStatus == 'InvoicingInProgress')
    ) {
      // return res.status(400).json({
      //   message: `Cannot ${action.toLowerCase()} for quoteStatus: ${
      //     serviceRequest.quoteStatus
      //   }`,
      // });

      // Update Service Request
      if (action === 'AllocationforInvoice') {
        serviceRequest.allocatedTo_name = name;
        serviceRequest.allocatedTo_email = email;
        serviceRequest.srStatus = 'InvoicingInProgress';
        serviceRequest.allocatedAt = new Date();
      } else if (action === 'ReallocationforInvoice') {
        serviceRequest.reallocatedTo_name = name;
        serviceRequest.reallocatedTo_email = email;
        serviceRequest.srStatus = 'InvoicingInProgress';
        serviceRequest.reallocatedAt = new Date();
      }
      await serviceRequest.save();

      // Log the action
      const InvoicelogEntry = new InvoiceAllocationLog({
        serviceRequestId,
        type,
        action,
        allocatedTo_name,
        allocatedTo_email,
        remarks,
      });
      await InvoicelogEntry.save();

      res.status(200).json({
        message: `Service Request ${serviceRequestId} allocated successfully for invoice.`,
        InvoicelogEntry,
      });
    }
  } catch (error) {
    next(error);
  }
};
const getQuotationAllocationLogs = async (req, res, next) => {
  try {
    const logs = await QuotationAllocationLog.find({ type: 'Quotation' }).sort({
      createdAt: -1,
    });
    res.status(200).json({ logs });
  } catch (error) {
    next(error);
  }
};
// const allocateForInvoice = async (req, res, next) => {
//   try {
//     const { serviceRequestId, name, email, remarks, action } = req.body;

//     // if (type === 'Invoice') {
//     // Validate action type
//     if (!['Allocation', 'Reallocation'].includes(action)) {
//       return res.status(400).json({
//         message: 'Invalid action. Use "Allocation" or "Reallocation".',
//       });
//     }

//     // Find the service request
//     const serviceRequest = await ServiceRequest.findOne({ serviceRequestId });
//     if (!serviceRequest) {
//       return res
//         .status(404)
//         .json({ message: `Service Request ${serviceRequestId} not found!` });
//     }

//     const user = await AdminCreateUser.findOne({ name, email, role: 'spc' });

//     if (!user) {
//       return res.status(202).json({ message: `${name} not found!` });
//     }

//     // Ensure the quote status is eligible
//     // if (
//     //   (serviceRequest.quoteStatus !== 'PendingRelease' &&
//     //     serviceRequest.quoteStatus !== 'ApprovalPending') ||
//     //   (serviceRequest.srStatus !== 'PendingForQuotationAllocation' &&
//     //     serviceRequest.srStatus !== 'QuotationInProgress')
//     // ) {
//     //   return res.status(400).json({
//     //     message: `Cannot ${action.toLowerCase()} for quoteStatus: ${
//     //       serviceRequest.quoteStatus
//     //     }`,
//     //   });
//     // }

//     if (
//       (serviceRequest.quoteStatus == 'BillingPending' &&
//         serviceRequest.quoteStatus == 'Billed') ||
//       (serviceRequest.srStatus == 'PendingforInvoiceAllocation' &&
//         serviceRequest.srStatus == 'InvoicingInProgress')
//     ) {
//       // return res.status(400).json({
//       //   message: `Cannot ${action.toLowerCase()} for quoteStatus: ${
//       //     serviceRequest.quoteStatus
//       //   }`,
//       // });

//       // Update Service Request
//       if (action === 'Allocation') {
//         serviceRequest.allocatedTo_name = name;
//         serviceRequest.allocatedTo_email = email;
//         serviceRequest.srStatus = 'InvoicingInProgress';
//         serviceRequest.allocatedAt = new Date();
//       } else if (action === 'Reallocation') {
//         serviceRequest.reallocatedTo_name = name;
//         serviceRequest.reallocatedTo_email = email;
//         serviceRequest.srStatus = 'InvoicingInProgress';
//         serviceRequest.reallocatedAt = new Date();
//       }
//       await serviceRequest.save();

//       // Log the action
//       const InvoicelogEntry = new InvoiceAllocationLog({
//         serviceRequestId,
//         type,
//         action,
//         allocatedTo_name,
//         allocatedTo_email,
//         remarks,
//       });
//       await InvoicelogEntry.save();
//     }

//     res.status(200).json({
//       message: `Service Request ${serviceRequestId} ${action.toLowerCase()}d successfully for invoice.`,
//       logEntry,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
const getInvoiceAllocationLogs = async (req, res, next) => {
  try {
    const logs = await InvoiceAllocationLog.find({ type: 'Invoice' }).sort({
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
      srStatus: 'Allocated',
    });

    for (const request of allocatedRequests) {
      // Fetch the current status from SAP OData
      const allocatedRequest = await allocateServiceRequest(
        request.serviceRequestId
      );

      console.log(
        `SAP Status for ServiceRequest ${request.serviceRequestId}: ${allocatedRequest}`
      );
      console.log(
        `Current Database Status (quoteStatus): ${request.quoteStatus}`
      );

      if (!allocatedRequest) continue; // Skip if unable to fetch from SAP

      // Check and update the status if it has changed in SAP

      if (
        allocatedRequest.quoteStatus === 'PendingRelease' &&
        request.quoteStatus === 'PendingRelease'
      ) {
        request.srStatus = 'PendingforReallocation';
        request.approvedAt = new Date();
      } else if (
        allocatedRequest.quoteStatus === 'ApprovalPending' &&
        request.quoteStatus === 'ApprovalPending'
      ) {
        request.srStatus = 'InProgress';
        request.releasedAt = new Date();
      } else if (
        allocatedRequest.quoteStatus === 'Rejected' &&
        request.quoteStatus === 'Rejected'
      ) {
        request.srStatus = 'ReallocatedforInvoice';
        request.rejectedAt = new Date();
      } else if (
        allocatedRequest.quoteStatus === 'Billed' &&
        request.quoteStatus === 'Billed'
      ) {
        request.srStatus = 'Closed';
        request.billedAt = new Date();
      }

      // Save only if the status was updated
      if (request.isModified('srStatus')) {
        await request.save();
        console.log(
          `${request.serviceRequestId} updated to status ${allocatedRequest}.`
        );
      }
    }
    console.log('Daily SAP status update completed successfully.');
  } catch (error) {
    console.error('Error updating service request statuses:', error);
  }
};

/**
 * Fetch allocation logs for Quotation.
 */
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
};
