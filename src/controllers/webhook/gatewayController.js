const express = require("express");
const { body, validationResult } = require("express-validator");
const { generateSalt, generatePassword } = require("../../helpers");
const User = require("../../models/User");

const gatewayRouter = express.Router();

gatewayRouter.post(
  "/RegisterUser",
  [
    body("MobileNumber").trim().notEmpty().withMessage("Phone number is required"),
    body("Password").trim().optional(),
    body("MembershipPlan").trim().notEmpty().withMessage("Membership plan is required"),
    body("ModeOfActivation").trim().notEmpty().withMessage("Mode of activation is required"),
    body("ExpiryDate").isNumeric().notEmpty().withMessage("Expiry date is required and must be the date time representation in seconds")
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { MobileNumber, Password, MembershipPlan, ModeOfActivation, ExpiryDate, Reference } = req.body;

      const isExist = await User.findOne({ phone: MobileNumber });
      if (isExist) {
        return res.status(409).send("User already exists with the same phone number");
      }

      const data = {
        phone: MobileNumber,
        SubscribedAt: ExpiryDate ? Date.now().toString() : undefined,
        expiresAt: ExpiryDate,
        paymentMethod: ModeOfActivation,
        membershipPlan: MembershipPlan,
        reference: Reference,
        paid: true,
        isPassExist: false
      };

      if (Password) {
        const salt = await generateSalt();
        const hashedPassword = await generatePassword(Password, salt);
        data.password = hashedPassword;
        data.salt = salt;
        data.isPassExist = true;
      }

      let user = await User.findOne({ phone: MobileNumber });
      if (user && !user.paid) {
        Object.keys(data).forEach(key => {
          user[key] = data[key];
        });
        await user.save();
        return res.status(201).send({ status: "success", message: "User created successfully" });
      }
      user = await User.create(data);
      if (!user) {
        return res.status(400).json({ status: false, message: "Failed to create user" });
      }
      return res.status(201).send({ status: "success", message: "User created successfully" });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

gatewayRouter.get("/CreateNewUser", async (req, res, next) => {
  try {
    const { MobileNumber, Password, MembershipPlan, ExpiryDate, Reference } = req.query;

    let phone;
    if (MobileNumber.startsWith(" ")) {
      phone = "+" + MobileNumber.trim();
    } else {
      phone = MobileNumber;
    }

    if (!MobileNumber || !MembershipPlan || !ExpiryDate) {
      return res.status(400).json({ status: false, message: "Missing required query parameters" });
    }

    let user = await User.findOne({ phone: phone });

    const data = {
      phone: phone,
      expiresAt: ExpiryDate,
      SubscribedAt: Date.now().toString(),
      membershipPlan: MembershipPlan,
      reference: Reference,
      paid: true,
      isPassExist: !!Password
    };

    if (Password) {
      const salt = await generateSalt();
      const hashedPassword = await generatePassword(Password, salt);
      data.password = hashedPassword;
      data.salt = salt;
    }

    if (user) {
      Object.assign(user, data);
      await user.save();
      return res.redirect(`${process.env.REDIRECT_URL}/phone-login?MobileNumber=${phone}`);
    } else {
      user = await User.create(data);
    }

    if (!user) {
      return res.redirect(`${process.env.REDIRECT_URL}/error?message=Something went wrong, try again`);
    }

    res.redirect(`${process.env.REDIRECT_URL}/phone-login?MobileNumber=${phone}`);
  } catch (err) {
    console.error(err);
    res.redirect(`${process.env.REDIRECT_URL}/error?message=Something went wrong, try again`);
  }
});

gatewayRouter.post(
  "/ExtendExpiryDate",
  [
    body("MobileNumber").trim().isMobilePhone().notEmpty().withMessage("Phone number is required"),
    body("ExpiryDate").isNumeric().notEmpty().withMessage("Expiry date is required and must be the date time representation in seconds")
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { MobileNumber, ExpiryDate } = req.body;

      const user = await User.findOneAndUpdate({ phone: MobileNumber }, { $set: { expiresAt: ExpiryDate } }, { new: true });

      if (!user) {
        return res.status(400).json({ status: false, message: "Failed to create user" });
      }
      return res.status(200).send({
        status: "success",
        message: "User subscription extended successfully"
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

gatewayRouter.post(
  "/UnregisterUser",
  [body("MobileNumber").trim().isMobilePhone().notEmpty().withMessage("Phone number is required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { MobileNumber } = req.body;

      const user = await User.findOneAndUpdate(
        { phone: MobileNumber },
        {
          $set: {
            expiresAt: undefined,
            reference: undefined,
            paid: false,
            paymentMethod: "",
            membershipPlan: ""
          }
        },
        { new: true }
      );

      if (!user) {
        return res.status(400).json({ status: false, message: "Failed to create user" });
      }
      return res.status(200).send({
        status: "success",
        message: "User subscription deleted successfully"
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

module.exports = gatewayRouter;
