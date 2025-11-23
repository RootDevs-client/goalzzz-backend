const express = require("express");
const { getAllNews, getSingleNews } = require("../../controllers/web/newsController");
const router = express.Router();

router.get("/", async (req, res) => {
  const allNews = await getAllNews({ page: req.query.page, limit: req.query.limit });
  res.status(200).json(allNews);
});

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  const allNews = await getSingleNews(slug);
  res.status(200).json(allNews);
});

module.exports = router;
