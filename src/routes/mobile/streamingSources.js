const express = require("express");
const {
  getStreamingSources,
} = require("../../controllers/mobile/streamingSourcesControllers");
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const reqBody = req.body;

    const publicIP =
      req.headers["cf-connecting-ip"] ||
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "";

    const match = await getStreamingSources(reqBody, publicIP);

    res.status(200).json({
      status: true,
      data: match,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
