const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const { generateSalt, generatePassword, validatePassword } = require("../../utils");

const createUserByLink = async (req, res, next) => {
  try {
    const { userId, accessCode } = req.query;

    if (!userId || !accessCode) {
      return res.status(400).json({
        status: false,
        message: "User ID and Access Code are required!"
      });
    }

    const existingUser = await User.findOne({ email: userId });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "User already exists!"
      });
    }

    const salt = await generateSalt();
    const hashedPassword = await generatePassword(accessCode, salt);

    const user = new User({
      email: userId,
      password: hashedPassword,
      salt: salt,
      email_verified: 1,
      provider: "accessCode"
    });

    await user.save();

    res.status(201).json({
      status: true,
      message: "User created successfully!"
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { userId, accessCode } = req.body;

    const user = await User.findOne({ email: userId });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found!"
      });
    }

    const validPassword = await validatePassword(accessCode, user.password, user.salt);

    if (!validPassword) {
      return res.status(401).json({
        status: false,
        message: "Invalid access code!"
      });
    }

    const token = jwt.sign({ userId: user.email }, process.env.APP_SECRET, {
      expiresIn: "999 years"
    });

    res.status(200).json({
      status: true,
      message: "Login successful!",
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUserByLink, loginUser };
