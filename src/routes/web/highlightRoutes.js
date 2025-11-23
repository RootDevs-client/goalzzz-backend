const express = require("express");
const { getAllNHighlights } = require("../../controllers/web/highlightController");
const router = express.Router();

router.get("/", async (req, res) => {
  const allHighlights = await getAllNHighlights({ page: req.query.page, limit: req.query.limit });
  res.status(200).json(allHighlights);
});

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  const allNews = await getSingleNews(slug);
  res.status(200).json(allNews);
});

module.exports = router;
