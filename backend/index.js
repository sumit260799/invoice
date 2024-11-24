const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;
const cors = require("cors");
const cookieparser = require("cookie-parser");
const path = require("path");
// express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());

// routes path
const authRoutes = require("./routes/authRoutes");
const serviceRequestRoute = require("./routes/serviceRequestRoute");
// const updateServiceRequestStatus = require('./services/cronUpdate');
// db connection..
const connectDB = require("./db/url");
connectDB();

// cors setup.....
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

// updateServiceRequestStatus();
app.use(cors(corsOptions));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// routes...
app.use("/api/auth", authRoutes);
app.use("/api/user", serviceRequestRoute);

app.listen(port, () => {
  console.log(`server listen at port ${port}`);
});
