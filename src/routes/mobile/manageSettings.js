const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const {
  getAppSettings,
} = require("../../controllers/mobile/appSettingsControllers");

// Get App Settings

router.post("/", async (req, res, next) => {
  try {
    const appBody = req.body;
    const app = await getAppSettings(appBody);

    res.status(200).json(app);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
