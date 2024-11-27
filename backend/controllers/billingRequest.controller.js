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

module.exports = {
  createServiceRequest,
  getServiceRequest,
  getServiceRequestByStatus,
  getAllServiceRequest,
  getServiceRequestbyEmail,
  updateServiceRequestStatus,
};
