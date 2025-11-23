const express = require("express");
const { body, param } = require("express-validator");
const {
  getBlackListEntries,
  getBlackListEntryById,
  createBlackListEntry,
  updateBlackListEntry,
  deleteBlackListEntry
} = require("../../controllers/web/blackListController");

const router = express.Router();

// Validation middleware
const ipValidation = body("ip").isString().trim().notEmpty();
const roleValidation = body("role").isString().trim().notEmpty().isIn(["guest", "logged-in", "subscribed"]);
const minutesWatchedValidation = body("minutes_watched").isNumeric();
const blockPeriodValidation = body("block_period").isNumeric();
const isBlockedValidation = body("is_blocked").isBoolean();
const popUpOpenedValidation = body("pop_up_opened").isNumeric();
const statusValidation = body("status").isNumeric();

// Create BlackList Entry Route Validation
const createBlackListValidation = [
  ipValidation,
  roleValidation,
  minutesWatchedValidation,
  blockPeriodValidation,
  isBlockedValidation,
  popUpOpenedValidation,
  statusValidation
];

// Update BlackList Entry Route Validation
const updateBlackListValidation = [
  ipValidation,
  roleValidation,
  minutesWatchedValidation,
  blockPeriodValidation,
  isBlockedValidation,
  popUpOpenedValidation,
  statusValidation
];

// Delete BlackList Entry Route Validation
const deleteBlackListValidation = [ipValidation];

router.get("/", getBlackListEntries);

router.get("/:id", getBlackListEntryById);

router.post("/create", createBlackListValidation, createBlackListEntry);

router.put("/update", updateBlackListEntry);

router.delete("/delete/:id", deleteBlackListValidation, deleteBlackListEntry);

module.exports = router;
