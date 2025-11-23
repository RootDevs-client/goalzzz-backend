const { body, param } = require("express-validator");
const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const AdsType = require("../../models/AdsType");

// validation
const validateCreateAdsType = [
  body("name").notEmpty().withMessage("Name is required!"),
];
const validateSingleAdsType = [
  param("adsTypeId").notEmpty().withMessage("AdsType ID is required!"),
];

// Get all AdsTypes
router.get("/", async (req, res, next) => {
  try {
    const adsTypes = await AdsType.find().sort({ createdAt: "desc" });

    res.status(200).json({
      status: true,
      message:
        adsTypes.length === 0
          ? "No AdsTypes found!"
          : "AdsTypes fetched successfully!",
      data: adsTypes,
    });
  } catch (error) {
    next(error);
  }
});

// Create an AdsType
router.post("/create", validateCreateAdsType, async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    }

    const { name, status, id } = req.body;

    const existingAds = await AdsType.find({ name });

    if (existingAds.length) {
      return res
        .status(409)
        .json({ status: false, message: "Ads type already exists!" });
    }

    const adsType = new AdsType({ name, status, id });

    const savedAdsType = await adsType.save();

    res.status(201).json({
      status: true,
      message: "AdsType created successfully!",
      data: savedAdsType,
    });
  } catch (error) {
    next(error);
  }
});

// Find Ads by Name
router.get("/:adsTypeId", validateSingleAdsType, async (req, res, next) => {
  try {
    const id = req.params.adsTypeId;
    const ads = await AdsType.find({ _id: id });

    if (ads.length === 0) {
      return res.status(404).json({ status: false, message: "Ads not found!" });
    }

    res.status(200).json({
      status: true,
      message: "Ads fetched successfully!",
      data: ads,
    });
  } catch (error) {
    next(error);
  }
});

// Update Ads by Id
router.put("/:adsTypeId", validateCreateAdsType, async (req, res, next) => {
  try {
    const id = req.params.adsTypeId;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    }

    const { status, name } = req.body;

    const existingAds = await AdsType.findById(id);

    if (!existingAds) {
      return res.status(404).json({ status: false, message: "Ads not found." });
    }

    // Check if another Ads with the same name already exists
    const existingAdsWithSameName = await AdsType.findOne({
      name,
      _id: { $ne: id },
    });

    if (existingAdsWithSameName) {
      return res.status(400).json({
        status: false,
        message: "Ads with the same name already exists.",
      });
    }

    // Update Ads properties
    existingAds.name = name || existingAds.name;
    existingAds.status = status || existingAds.status;

    const updatedAds = await existingAds.save();

    res.status(200).json({
      status: true,
      message: "Ads updated successfully",
      data: updatedAds,
    });
  } catch (error) {
    next(error);
  }
});

// Delete Ads by Id
router.delete("/:adsTypeId", validateSingleAdsType, async (req, res, next) => {
  try {
    const id = req.params.adsTypeId;
    const deletedAds = await AdsType.findByIdAndDelete(id);

    if (!deletedAds) {
      return res.status(404).json({ status: false, message: "Ads not found!" });
    }

    res.status(200).json({
      status: true,
      message: "Ads deleted successfully!",
      data: deletedAds,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
