const User = require("../models/User");
const { validateSignature } = require("../utils");
const jwt = require("jsonwebtoken");

const IS_DEV = process.env.NODE_ENV === "development";

const userAuth = async (req, res, next) => {
  const isAuthorized = await validateSignature(req);
  console.log("IsAuthorized", isAuthorized);

  if (isAuthorized) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized: Please log in first" });
};

const userAuthorization = (req, res, next) => {
  if (["superAdmin", "admin", "subAdmin"].includes(req.user.admin_type)) {
    return next();
  }
  return res.status(403).json({ message: "Your credentials are not authorized" });
};

const verifyApiKeyBody = async (req, res, next) => {
  const API_KEY = req.body.api_key;
  if (API_KEY !== process.env.API_KEY) {
    res.status(401).json({
      status: false,
      message: "Unauthorized: Invalid API key or API key not found"
    });
  } else {
    return next();
  }
};

const verifyApiKeyHeader = (req, res, next) => {
  const API_KEY = req.headers["x-api-key"];
  if (API_KEY !== process.env.API_KEY) {
    res.status(401).json({
      status: false,
      message: "Unauthorized: Invalid API key or API key not found"
    });
  } else {
    next();
  }
};

async function decodeAuthToken(token) {
  if (!token) throw new Error("Invalid token");
  const decoded = jwt.verify(token, process.env.APP_SECRET);
  if (!decoded) return null;
  const user = await User.findOne({ phone: decoded.phone });
  if (!user) return null;
  return user;
}

const auth = async (req, res, next) => {
  try {
    const token = req?.cookies?.[process.env.COOKIE_KEY] || req?.headers?.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ status: false, message: "Unauthorized: Please log in first" });
    }
    const decoded = await decodeAuthToken(token);

    if (!decoded) {
      return res.status(401).json({ status: false, message: "Unauthorized: Invalid token" });
    }
    if (!decoded?.paid && decoded.role === "user") {
      res.clearCookie(process.env.COOKIE_KEY, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development" ? false : true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        priority: "high",
        domain: process.env.OWN_DOMAIN,
        expires: new Date(Date.now())
      });
      return res.status(402).json({ status: false, message: "Please purchase a subscription plan to continue." });
    }
    const isSubscriptionExpired = Date.now() / 1000 > decoded.expiresAt;
    if (isSubscriptionExpired) {
      const user = await User.findOne({ phone: decoded.phone });
      user.subscription = undefined;
      user.paid = false;
      user.expiresAt = "";
      user.SubscribedAt = "";
      user.stripeCustomerId = "";
      user.subscriptionId = "";
      await user.save();
      !IS_DEV &&
        (await unsubscribeUserFromStarGame({
          phone: user.phone,
          reference: user?.reference
        }));
      return res
        .status(402)
        .json({ status: false, message: "Your subscription has expired. Please purchase a subscription plan to continue." });
    }
    req.user = decoded;
    return next();
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, message: "Something went wrong" });
  }
};

module.exports = {
  userAuth,
  userAuthorization,
  verifyApiKeyBody,
  verifyApiKeyHeader,
  auth
};
