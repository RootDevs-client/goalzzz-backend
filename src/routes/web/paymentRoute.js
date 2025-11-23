const express = require("express");
const { body, validationResult } = require("express-validator");
const Subscription = require("../../models/Subscription");
const User = require("../../models/User");
const { generateSalt, generatePassword } = require("../../helpers");
const Payment = require("../../models/Payment");
const StripePay = require("../../services/stripePay");
const { auth } = require("../../middlewares/userAuth");
const { unsubscribeUserFromStarGame } = require("../../controllers/proxyCom/stargamez");
const router = express.Router();

const stripe = new StripePay(process.env.STRIPE_SECRET_KEY);

const IS_DEV = process.env.NODE_ENV === "development";

router.post(
  "/",
  [
    body("phone").trim().notEmpty().withMessage("Phone number is required!"),
    body("password").trim().notEmpty().withMessage("Password is required!"),
    body("subscription").trim().notEmpty().withMessage("Subscription ID is required!")
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }
      const { phone, password, subscription } = req.body;
      const package = await Subscription.findById(subscription);
      if (!package) {
        return res.status(404).json({
          status: false,
          message: "Invalid subscription ID, Subscription not found"
        });
      }
      let user = await User.findOne({ phone });
      if (user && !user.paid) {
        const salt = await generateSalt();
        const hashedPassword = await generatePassword(password, salt);
        user.salt = salt;
        user.rawPassword = password;
        user.password = hashedPassword;
        user.subscription = package._id;
        await user.save();
      }
      if (!user) {
        const salt = await generateSalt();
        const hashedPassword = await generatePassword(password, salt);
        user = await User.create({
          phone,
          password: hashedPassword,
          salt,
          status: 1,
          role: "user",
          rawPassword: password,
          provider: "phone",
          subscription: package._id
        });
      }

      const payment = await Payment.create({
        subscription: package._id,
        user: user._id
      });
      if (!payment) {
        return res.status(503).json({ status: false, message: "Failed to create payment" });
      }
      const session = await stripe.createCheckoutSession({
        userId: user._id.toString(),
        paymentId: payment._id.toString(),
        price: package.price,
        interval: package.duration_type,
        productName: package.title
      });
      return res.json({ status: true, data: { session: session.url } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

router.post("/cancel", auth, async (req, res, next) => {
  try {
    const user = await User.findOne({ phone: req.user.phone }).select("subscriptionId isPassExist reference phone");
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found!" });
    }

    if (!user?.isPassExist || !user?.subscriptionId) {
      !IS_DEV &&
        (await unsubscribeUserFromStarGame({
          phone: user.phone,
          reference: user?.reference
        }));
    } else {
      const isCancelled = await stripe.cancelSubscription(user.subscriptionId);
      if (!isCancelled) {
        return res.status(503).json({ status: false, message: "Failed to cancel subscription" });
      }
    }

    // if (user.reference) {
    //   user.reference = "";
    //   user.expiresAt = "";
    //   user.paid = false;
    //   await user.save();
    // }

    return res.json({
      status: true,
      message: "Subscription cancelled request submitted successfully!"
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
