const cron = require("node-cron");
const ServiceRequest = require("../models/serviceRequestSchema.js");
const QuoteModel = require("../models/quotationModel.js");
const updateServiceRequestStatus = require("../services/quoteStatusUpdate.js");

// Schedule the cron job to run every minute
cron.schedule("* * * * *", async () => {
  console.log(
    "Running cron job: Checking and updating ServiceRequest statuses..."
  );
  await updateServiceRequestStatus();
});

module.exports = updateServiceRequestStatus;
