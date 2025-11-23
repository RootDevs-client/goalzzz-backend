const { validationResult } = require("express-validator");
const AppSettings = require("../../models/AppSettings");

// Get App Settings
const getAppSettings = async (req, res, next) => {
  try {
    const appSettings = await AppSettings.findOne();
    if (!appSettings) {
      return res.status(404).json({
        status: false,
        message: "App Settings not found!",
        data: null
      });
    }
    return res.status(200).json({
      status: true,
      message: "App settings fetched successfully!",
      data: appSettings
    });
  } catch (error) {
    console.error(error);
    next();
  }
};

// Create or Update App Settings
const createOrUpdateAppSettings = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: false, errors: errors.array() });
  }

  try {
    let appSettings = await AppSettings.findOne();

    if (!appSettings) {
      // If no settings exist, create a new one
      appSettings = new AppSettings(req.body);
      await appSettings.save();
      res.status(201).json({
        status: true,
        message: "App settings created successfully!",
        data: appSettings
      });
    } else {
      // If settings exist, update the existing one
      appSettings.set(req.body);
      await appSettings.save();
      res.json({
        status: true,
        message: "App settings updated successfully!",
        data: appSettings
      });
    }
  } catch (error) {
    console.error(error);
    next();
  }
};

// Delete App Settings
const deleteAppSettings = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: false, errors: errors.array() });
  }

  const { id } = req.params;

  try {
    const deletedAppSettings = await AppSettings.findByIdAndDelete(id);

    if (!deletedAppSettings) {
      return res.status(404).json({ status: false, message: "App Settings not found" });
    }

    res.json({
      status: true,
      message: "App Settings deleted successfully",
      data: deletedAppSettings
    });
  } catch (error) {
    console.error(error);
    next();
  }
};

module.exports = {
  getAppSettings,
  createOrUpdateAppSettings,
  deleteAppSettings
};
