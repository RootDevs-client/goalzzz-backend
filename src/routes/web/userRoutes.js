const express = require("express");
const userController = require("../../controllers/web/userControllers");
const { body, validationResult } = require("express-validator");
const { userAuth, auth } = require("../../middlewares/userAuth");
const User = require("../../models/User");
const { validatePassword } = require("../../helpers");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Route for user register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required!"),
    body("email").trim().isEmail().withMessage("Invalid email format!"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required!")
      .isLength({ min: 8 })
      .withMessage("Password length at least 8 characters!"),
    body("provider").trim().notEmpty().withMessage("Provider is required!"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { name, email, password, provider, image } = req.body;
      const userData = {
        name,
        email,
        password,
        provider,
        image,
      };

      const newUser = await userController.createUser(userData);

      return res.status(200).json(newUser);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Route for user login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      const data = await userController.signIn({ email, password });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Route for verify email using otp
router.post(
  "/verify-email",
  [body("otp").notEmpty().withMessage("OTP is required!")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { otp } = req.body;
      const { token } = req.headers;
      const data = await userController.verifyEmail({ token, otp });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Route to resend verification email
router.post(
  "/resend-otp",
  [body("email").isEmail().withMessage("Invalid email format")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email } = req.body;

      const data = await userController.ResendOTP({ email });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Route for changing user password
router.put(
  "/change-password",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").notEmpty().withMessage("New password is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email, oldPassword, newPassword } = req.body;

      // Call the controller function to change the password
      const data = await userController.ChangePassword({
        email,
        oldPassword,
        newPassword,
      });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Route for getting access token by using refresh token
router.post("/refresh-token", userAuth, async (req, res, next) => {
  try {
    const data = await userController.getAccessToken(req.user);
    return res.json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Route for user profile
router.post(
  "/profile",
  userAuth,
  // [body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { phone } = req.body;

      const data = await userController.GetProfile({ phone });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Route for updating user profile
router.put(
  "/profile",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email, name, image, role } = req.body;

      const data = await userController.UpdateProfile({
        email,
        name,
        image,
        role,
      });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Update User Favorites by Email
router.put("/favorites", async (req, res, next) => {
  try {
    const { phone, key, item } = req.body;

    // Validate key
    const validKeys = ["teams", "leagues", "matches"];
    if (!validKeys.includes(key)) {
      return res.status(400).json({
        status: false,
        message: "Invalid key. Accepted keys are teams, leagues, matches.",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { phone: phone },
      {
        $addToSet: { [`favorites.${key}`]: item },
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found.",
      });
    }

    res.status(201).json({
      status: true,
      message: `User ${key} updated successfully!`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// Update User Favorites by Email
router.put("/favorites", async (req, res, next) => {
  try {
    const { phone, key, item } = req.body;

    // Validate key
    const validKeys = ["teams", "leagues", "matches"];
    if (!validKeys.includes(key)) {
      return res.status(400).json({
        status: false,
        message: "Invalid key. Accepted keys are teams, leagues, matches.",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { phone: phone },
      {
        $addToSet: { [`favorites.${key}`]: item },
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found.",
      });
    }

    res.status(201).json({
      status: true,
      message: `User ${key} updated successfully!`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// Remove Item from User Favorites by Phone and ID
router.put("/favorites/remove", async (req, res, next) => {
  try {
    const { phone, key, item } = req.body;

    // Validate key
    const validKeys = ["teams", "leagues", "matches"];
    if (!validKeys.includes(key)) {
      return res.status(400).json({
        status: false,
        message: "Invalid key. Accepted keys are teams, leagues, matches.",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { phone: phone },
      {
        $pull: { [`favorites.${key}`]: { id: item.id } },
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      status: true,
      message: `Item with id ${item.id} removed from user ${key} successfully!`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// Delete User Account
router.delete(
  "/delete",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email } = req.body;
      const data = await userController.DeleteUser({ email });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

router.post(
  "/auth",
  [
    body("phone").notEmpty().withMessage("Phone is required"),
    body("password").optional(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }
      const { phone } = req.body;
      const user = await User.findOne({ phone: phone });
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }
      if (!user.paid && user.role === "user") {
        return res.status(402).json({
          status: false,
          message: "Please purchase a subscription plan to continue.",
        });
      }
      if (user?.isPassExist) {
        if (!req.body?.password) {
          return res.status(401).json({
            status: false,
            message: "Password is required to access pass",
          });
        }

        const isValidPassword = await validatePassword(
          req?.body?.password,
          user.password,
          user.salt
        );
        if (!isValidPassword) {
          return res
            .status(401)
            .json({ status: false, message: "Invalid password" });
        }
      }
      const token = jwt.sign(
        { id: user._id, phone: user.phone },
        process.env.APP_SECRET
      );
      // res.cookie(process.env.COOKIE_KEY, token, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "development" ? false : true,
      //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      //   priority: "high",
      //   domain: process.env.OWN_DOMAIN,
      //   expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      // });
      const accessToken = jwt.sign(
        { id: user._id, phone: user.phone },
        process.env.APP_SECRET,
        {
          expiresIn: "3d",
        }
      );
      const refreshToken = jwt.sign(
        { id: user._id, phone: user.phone },
        process.env.APP_SECRET,
        {
          expiresIn: "5d",
        }
      );
      return res
        .status(200)
        .json({ status: true, data: { user, accessToken, refreshToken } });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

router.get("/me", auth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ status: false, message: "User not authenticated" });
    }
    return res.status(200).json({ status: true, user: req.user });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post("/sign-out", auth, async (req, res, next) => {
  try {
    // res.clearCookie(process.env.COOKIE_KEY, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "development" ? false : true,
    //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    //   priority: "high",
    //   domain: process.env.OWN_DOMAIN,
    //   expires: new Date(Date.now()),
    // });
    return res
      .status(200)
      .json({ status: true, message: "User signed out successfully" });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
