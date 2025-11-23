const express = require("express");
const { body, param } = require("express-validator");
const { getAppSettings, createOrUpdateAppSettings, deleteAppSettings } = require("../../controllers/admin/appSettingsController");

const router = express.Router();

// Validation middleware
const playerIdValidation = body("jw_player.player_id").isString().trim().notEmpty();
const playerLogoValidation = body("jw_player.player_logo").isString().trim().notEmpty();
const guestPopupTimeValidation = body("popup.guest_popup_time").isNumeric().isIn([10, 20, 30, 60, 90, 120]);
const guestPopupDurationValidation = body("popup.guest_popup_duration").isNumeric().isIn([1, 2, 3, 4, 5]);
const loginPopupTimeValidation = body("popup.login_popup_time").isNumeric().isIn([10, 20, 30, 60, 90, 120]);
const loginPopupDurationValidation = body("popup.login_popup_duration").isNumeric().isIn([1, 2, 3, 4, 5]);
const idParamValidation = param("id").isMongoId();

// Get App Settings Route Validation
const getAppSettingsValidation = [];

// Create or Update App Settings Route Validation
const createOrUpdateAppSettingsValidation = [
  playerIdValidation,
  playerLogoValidation,
  guestPopupTimeValidation,
  guestPopupDurationValidation,
  loginPopupTimeValidation,
  loginPopupDurationValidation
];

// Delete App Settings Route Validation
const deleteAppSettingsValidation = [idParamValidation];

router.get("/", getAppSettings);

router.post("/", createOrUpdateAppSettingsValidation, createOrUpdateAppSettings);

router.delete("/:id", deleteAppSettingsValidation, deleteAppSettings);

module.exports = router;
