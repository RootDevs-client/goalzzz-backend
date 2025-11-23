// highlightRoutes.js
const express = require("express");
const { body, param } = require("express-validator");
const { validationResult } = require("express-validator");
const Highlight = require("../../models/Highlight");
const {
  transformErrorsToMap,
  getSlugify,
  generateRandomId,
  formatDate,
} = require("../../utils");
const GeneralSettings = require("../../models/GeneralSetting");

const router = express.Router();

// validation
const validateCreateHighlight = [
  body("title").notEmpty().withMessage("Title is required!"),
  body("video_type").notEmpty().withMessage("Video type is required!"),
];

const validateSingleHighlight = [
  param("highlightId").notEmpty().withMessage("Highlight ID is required!"),
];

// Get All Highlights
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const totalDocs = await Highlight.countDocuments().exec();
    const totalPages = Math.ceil(totalDocs / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    const nextPage = hasNextPage ? pageNum + 1 : null;
    const prevPage = hasPrevPage ? pageNum - 1 : null;

    const highlights = await Highlight.find()
      .sort({ createdAt: "desc" })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      status: true,
      message:
        highlights.length === 0
          ? "No highlights found!"
          : "Highlights fetched successfully!",
      data: highlights,
      pagination: {
        totalDocs,
        totalPages,
        currentPage: pageNum,
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage,
      },
    });
  } catch (error) {
    next(error);
  }
});
// Create A Highlight
router.post("/create", validateCreateHighlight, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errorMessages });
    }

    const {
      title,
      short_description,
      video_type,
      youtube_url,
      thumbnail_type,
      highlight_image,
      fixture_id,
      videos,
      status,
    } = req.body;

    const highlight = new Highlight({
      title,
      short_description,
      video_type,
      youtube_url,
      thumbnail_type,
      highlight_image,
      fixture_id,
      videos,
      status,
    });

    const savedHighlight = await highlight.save();

    res.status(201).json({
      status: true,
      message: "Highlight created successfully!",
      data: savedHighlight,
    });
  } catch (error) {
    next(error);
  }
});

// Find Highlight by ID
router.get("/:highlightId", validateSingleHighlight, async (req, res, next) => {
  try {
    const id = req.params.highlightId;
    const highlight = await Highlight.findOne({ _id: id });

    if (!highlight) {
      return res
        .status(404)
        .json({ status: false, message: "Highlight not found!" });
    }

    res.status(200).json({
      status: true,
      message: "Highlight fetched successfully!",
      data: highlight,
    });
  } catch (error) {
    next(error);
  }
});

// Update Highlight by Id
router.put("/:highlightId", validateCreateHighlight, async (req, res, next) => {
  try {
    const id = req.params.highlightId;
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errorMessages });
    }

    const {
      title,
      short_description,
      video_type,
      youtube_url,
      thumbnail_type,
      highlight_image,
      fixture_id,
      videos,
      status,
    } = req.body;

    const updatedHighlight = await Highlight.findByIdAndUpdate(
      id,
      {
        title,
        short_description,
        video_type,
        youtube_url,
        thumbnail_type,
        highlight_image,
        fixture_id,
        videos,
        status,
      },
      {
        new: true,
      }
    );

    res.status(201).json({
      status: true,
      message: "Highlight updated successfully!",
      data: updatedHighlight,
    });
  } catch (error) {
    next(error);
  }
});

// Delete all News
router.delete("/delete-all", async (req, res, next) => {
  try {
    const deletedHighlights = await Highlight.deleteMany({});

    if (deletedHighlights.deletedCount === 0) {
      return res
        .status(200)
        .json({ status: false, message: "No Highlights to delete!" });
    }

    res.status(200).json({
      status: true,
      message: "All Highlight deleted successfully!",
      data: deletedHighlights,
    });
  } catch (error) {
    next(error);
  }
});

// Delete a Highlight by Id
router.delete(
  "/:highlightId",
  validateSingleHighlight,
  async (req, res, next) => {
    try {
      const id = req.params.highlightId;
      const deletedHighlight = await Highlight.findByIdAndDelete(id);

      if (!deletedHighlight) {
        return res
          .status(404)
          .json({ status: false, message: "Highlight not found!" });
      }

      res.status(200).json({
        status: true,
        message: "Highlight deleted successfully!",
        data: deletedHighlight,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/youtube-videos", async (req, res, next) => {
  try {
    const { channelId, category, categoryType } = req.body;

    const generalSettings = await GeneralSettings.findOne();

    const currentDate = new Date();
    const targetTimestamp = new Date(currentDate).setDate(
      currentDate.getDate() - generalSettings?.days_highlight
    );
    const q = "highlights | shorts";
    const dataUrl = `https://www.googleapis.com/youtube/v3/search?q=${q}&maxResults=${50}&part=snippet&order=date&type=video&channelId=${channelId}&key=${
      process.env.YOUTUBE_API_KEY
    }&videoDuration=short`;

    if (!channelId)
      return res
        .status(404)
        .json({ status: false, message: "Channel ID not provided" });

    const response = await fetch(dataUrl);
    const videos = await response.json();

    const highlights = [];

    videos?.items?.map((item) => {
      const isHighlight = item.snippet.title
        .toLowerCase()
        .includes("highlights");
      const isShort = item.snippet.title.toLowerCase().includes("shorts");
      const isRecent = new Date(item.snippet.publishedAt) > targetTimestamp;

      if (isHighlight && isRecent) {
        const video = {
          title: item.snippet.title,
          short_description: item.snippet.description,
          date: formatDate(new Date(item.snippet.publishedAt)),
          video_type: "youtube",
          youtube_url: `https://www.youtube.com/embed/${item.id.videoId}`,
          thumbnail_type: "url",
          highlight_image: item.snippet.thumbnails.high.url,
          slug: `${getSlugify(item.snippet.title)}-${getSlugify(
            category.name
          )}`,
          // category: category.name,
          // categoryId: category.id,
          // categoryImage: category.logo,
          // categoryType: categoryType,
          status: "1",
        };

        highlights.push(video);
      }
    });

    const allHighlightFromDb = await Highlight.find();

    const uniqueHighlights = highlights.filter(
      (highlight) =>
        !allHighlightFromDb.some((hgLight) => hgLight.title === highlight.title)
    );

    await Highlight.insertMany(uniqueHighlights);

    res
      .status(200)
      .json({
        status: true,
        message: "Videos retrieved successfully",
        highlightsCount: uniqueHighlights?.length,
      });
  } catch (error) {
    console.error("Error getting all video categories:", error);
    next(error);
  }
});

module.exports = router;
