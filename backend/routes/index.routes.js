const allocationRoute = require("./allocation.routes");
const billingRequestRoute = require("./billingRequest.routes");

module.exports = function (app) {
  app.use("/api/user", allocationRoute);
  app.use("/api/user", billingRequestRoute);
};
