const { body, param } = require("express-validator");
const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const News = require("../../models/News");
const {
  transformErrorsToMap,
  getSlugify,
  generateRandomId,
} = require("../../utils");
const fetch90min = require("../../90min/fetch90min");

// validation
const validateCreateAdsType = [
  body("title").notEmpty().withMessage("Title is required!"),
  body("description").notEmpty().withMessage("Description is required!"),
  body("news_image").notEmpty().withMessage("Image is required!"),
  body("publish_date").notEmpty().withMessage("Publish date is required!"),
  body("status").notEmpty().withMessage("Status is required!"),
];

const validateSingleNews = [
  param("newsId").notEmpty().withMessage("AdsType ID is required!"),
];

// Get All News
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const totalDocs = await News.countDocuments().exec();
    const totalPages = Math.ceil(totalDocs / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    const nextPage = hasNextPage ? pageNum + 1 : null;
    const prevPage = hasPrevPage ? pageNum - 1 : null;

    const news = await News.find()
      .select({ title: 1, category: 1, image: 1, status: 1, publish_date: 1 })
      .sort({ createdAt: "desc" })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      status: true,
      message:
        news.length === 0 ? "No news found!" : "News fetched successfully!",
      data: news,
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

// Create A News
router.post("/create", validateCreateAdsType, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errorMessages });
    }

    const { title, description, news_image, publish_date, status } = req.body;

    const news = new News({
      title,
      slug: `${getSlugify(title)}-${generateRandomId(9)}`,
      description,
      image: news_image,
      publish_date,
      status,
    });

    const savedNews = await news.save();

    res.status(201).json({
      status: true,
      message: "News created successfully!",
      data: savedNews,
    });
  } catch (error) {
    next(error);
  }
});

// get Auto Fetch news

router.post("/auto-generate", async (req, res, next) => {
  try {
    const { newsUrl, league, categoryType } = req.body;

    const category = {
      id: league?.id,
      name: league?.name,
      logo: league?.logo,
      type: categoryType,
      newsSource: newsUrl,
    };

    const allNews = await fetch90min(category);

    const allNewsFromDb = await News.find();

    const uniqueNews = allNews?.filter(
      (news) => !allNewsFromDb.some((newsObj) => newsObj.title === news.title)
    );

    await News.insertMany(uniqueNews);
    res.status(200).json({
      status: true,
      message: "successFully fetch all news!",
      newsCount: uniqueNews?.length,
    });
  } catch (err) {
    next(err);
    console.log("error", err);
  }
});

// Find News by ID
router.get("/:newsId", validateSingleNews, async (req, res, next) => {
  try {
    const id = req.params.newsId;
    const news = await News.findOne({ _id: id });

    if (news.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "News not found!" });
    }

    res.status(200).json({
      status: true,
      message: "News fetched successfully!",
      data: news,
    });
  } catch (error) {
    next(error);
  }
});

// Update News by Id
router.put("/:newsId", validateCreateAdsType, async (req, res, next) => {
  try {
    const id = req.params.newsId;
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errorMessages });
    }

    const { title, description, news_image, publish_date, status } = req.body;

    const updatedNews = await News.findByIdAndUpdate(
      id,
      {
        title,
        slug: `${getSlugify(title)}-${generateRandomId(9)}`,
        description,
        image: news_image,
        publish_date,
        status,
      },
      {
        new: true,
      }
    );

    res.status(201).json({
      status: true,
      message: "News updated successfully!",
      data: updatedNews,
    });
  } catch (error) {
    next(error);
  }
});

// Delete all News
router.delete("/delete-all", async (req, res, next) => {
  try {
    const deletedNews = await News.deleteMany({});

    if (deletedNews.deletedCount === 0) {
      return res
        .status(200)
        .json({ status: false, message: "No news to delete!" });
    }

    res.status(200).json({
      status: true,
      message: "All news deleted successfully!",
      data: deletedNews,
    });
  } catch (error) {
    next(error);
  }
});

// Delete a News by Id
router.delete("/:newsId", validateSingleNews, async (req, res, next) => {
  try {
    const id = req.params.newsId;
    const deletedNews = await News.findByIdAndDelete(id);

    if (!deletedNews) {
      return res
        .status(404)
        .json({ status: false, message: "News not found!" });
    }

    res.status(200).json({
      status: true,
      message: "News deleted successfully!",
      data: deletedNews,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
