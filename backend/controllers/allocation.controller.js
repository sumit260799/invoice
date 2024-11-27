const ServiceRequest = require("../models/serviceRequestSchema.js");
const ChangeLog = require("../models/ChangeLogSchema.js");
const sendAllocationEmail = require("../middleware/allocationEmail.js");

const allocateForQuotation = async (req, res, next) => {
  try {
    const { email, name: fullName, role } = req.user;

    if (!(role === "billingManager" || role === "admin")) {
      return res
        .status(404)
        .json({ message: `You are not authorized to perform this action` });
    }

    const {
      serviceRequestId,
      name,
      email: allocatedEmail,
      remarks,
      action,
    } = req.body;

    // Validate action type
    if (
      ![
        "AllocationforQuotation",
        "ReallocationforQuotation",
        "AllocationforInvoice",
        "ReallocationforInvoice",
      ].includes(action)
    ) {
      return res.status(400).json({ message: `Invalid action: ${action}` });
    }

    // Find the service request
    const billingRequest = await ServiceRequest.findOne({ serviceRequestId });
    if (!billingRequest) {
      return res
        .status(404)
        .json({ message: `Billing Request ${serviceRequestId} not found!` });
    }

    // Determine if the action is valid based on statuses
    if (
      (billingRequest.quoteStatus === "PendingRelease" ||
        billingRequest.quoteStatus === "ApprovalPending" ||
        billingRequest.quoteStatus === "Rejected" ||
        billingRequest.billingProgressStatus ===
          "PendingForQuotationAllocation" ||
        billingRequest.billingProgressStatus === "QuotationInProgress") &&
      action.includes("Quotation")
    ) {
      // Update for Quotation Allocation/Reallocation
      const updateFields =
        action === "AllocationforQuotation"
          ? {
              allocatedTo_name: name,
              allocatedTo_email: allocatedEmail,
              billingProgressStatus: "QuotationInProgress",
              allocatedAt: new Date(),
            }
          : {
              reallocatedTo_name: name,
              reallocatedTo_email: allocatedEmail,
              billingProgressStatus: "QuotationInProgress",
              reallocatedAt: new Date(),
            };

      await ServiceRequest.updateOne(
        { serviceRequestId },
        { $set: updateFields }
      );

      await ChangeLog.create({
        serviceRequestId,
        changeType: "allocationStatus",
        newValue: action,
        remarks: remarks || "Allocation/Reallocation for Quotation",
      });

      await sendAllocationEmail(
        allocatedEmail,
        "Quotation Allocation Notification",
        `Hello ${name},\n\nYou have been ${
          action === "AllocationforQuotation"
            ? "allocated for quotation"
            : "reallocated for quotation"
        }.\nBilling Request ID: ${serviceRequestId}\nRemarks: ${
          remarks || "Allocation for Quotation"
        }\n\nYou have been assigned by: ${fullName}<${email}>\n\nRegards,\nYour Team`
      );

      return res.status(200).json({
        message: `Billing Request ${serviceRequestId} ${action.toLowerCase()}d successfully for quotation.`,
      });
    } else if (
      billingRequest.quoteStatus === "BillingPending" &&
      (billingRequest.billingProgressStatus === "PendingforInvoiceAllocation" ||
        billingRequest.billingProgressStatus === "InvoicingInProgress") &&
      action.includes("Invoice")
    ) {
      // Update for Invoice Allocation/Reallocation
      const updateFields =
        action === "AllocationforInvoice"
          ? {
              allocatedTo_name: name,
              allocatedTo_email: allocatedEmail,
              billingProgressStatus: "InvoicingInProgress",
              allocatedAt: new Date(),
            }
          : {
              reallocatedTo_name: name,
              reallocatedTo_email: allocatedEmail,
              billingProgressStatus: "InvoicingInProgress",
              reallocatedAt: new Date(),
            };

      await ServiceRequest.updateOne(
        { serviceRequestId },
        { $set: updateFields }
      );

      await ChangeLog.create({
        serviceRequestId,
        changeType: "allocationStatus",
        newValue: action,
        remarks: remarks || "Allocation/Reallocation for Invoice",
      });

      await sendAllocationEmail(
        allocatedEmail,
        "Invoice Allocation Notification",
        `Hello ${name},\n\nYou have been ${
          action === "AllocationforInvoice"
            ? "allocated for invoicing"
            : "reallocated for invoicing"
        }.\nBilling Request ID: ${serviceRequestId}\nRemarks: ${
          remarks || "Allocation for Invoice"
        }\n\nYou have been assigned by: ${fullName}<${email}>\n\nRegards,\nYour Team`
      );

      return res.status(200).json({
        message: `Billing Request ${serviceRequestId} ${action.toLowerCase()}d successfully for invoice.`,
      });
    } else {
      return res.status(400).json({
        message: `Cannot ${action.toLowerCase()} for current statuses.`,
      });
    }
  } catch (error) {
    console.error("Error in allocation:", error.message);
    next(error);
  }
};

const getUsers = async (req, res) => {
  res.send("hello sumit");
};
module.exports = { allocateForQuotation, getUsers };
