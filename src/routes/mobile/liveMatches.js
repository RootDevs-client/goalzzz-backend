const express = require("express");
const {
  getLiveMatches,
} = require("../../controllers/mobile/liveMatchesControllers");
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const reqBody = req.body;
    const match = await getLiveMatches(reqBody);

    res.status(200).json({
      status: true,
      data: match,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
