// External Import
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

// Internal Import
const config = require("./config");
const connectToDatabase = require("./database");
const adminRouter = require("../src/routes/adminRouter");
// const mobileRouter = require("../src/routes/mobileRouter");
const webRouter = require("../src/routes/webRouter");
const errorMiddleware = require("../src/middlewares/errorMiddleware");
const { verifyApiKeyHeader } = require("../src/middlewares/userAuth");
const { sportMonksV3Data } = require("../src/controllers/web/sportMonksV3Controller");
const { ipHandler } = require("../src/controllers/ip/checkIP");
const getUserIpMiddleware = require("../src/middlewares/getUserIpMiddleware");
const accessController = require("../src/controllers/web/accessController");
const { createUserByLink, loginUser } = require("../src/controllers/admin/createUserController");
const stripeRouter = require("../src/controllers/webhook/stripeController");
const gatewayRouter = require("../src/controllers/webhook/gatewayController");

const app = express();
const env = process.env.NODE_ENV || "development";

// Connect to MongoDB with Mongoose
connectToDatabase(config[env].databaseURI);

// Middleware
app.use(morgan("dev"));
app.use(cors(config[env].corsOptions));
app.use(cookieParser());
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// File Access
app.use("/", express.static(path.join(__dirname, "../public")));
app.use("/images", express.static(path.join(__dirname, "../uploads/images")));

// Router
app.get("/", (req, res) => {
  console.log(req.method);
  res.send("Welcome to goalzzz Web App!");
});

app.use(getUserIpMiddleware);

app.use("/api/ip", ipHandler);

app.use("/webhook", stripeRouter);

app.use("/PaymentGateway", gatewayRouter);

app.get("/api/create-user", createUserByLink);
app.post("/api/user-login", loginUser);

app.use("/api", webRouter); // web
app.post("/api/access", verifyApiKeyHeader, accessController);
app.use("/api/admin", verifyApiKeyHeader, adminRouter); // admin
app.use("/v3/football/*", verifyApiKeyHeader, sportMonksV3Data); // web
// app.use("/api/v1", verifyApiKeyHeader, mobileRouter); // mobile

// Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
