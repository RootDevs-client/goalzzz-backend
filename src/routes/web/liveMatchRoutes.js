const express = require("express");
const { getAllLiveMatches, getSingleLiveMatch } = require("../../controllers/web/liveMatchController");
const router = express.Router();

router.get("/", async (req, res) => {
  const liveMatches = await getAllLiveMatches();
  res.status(200).json(liveMatches);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const publicIP = req.userIp;

  const liveMatch = await getSingleLiveMatch({ id, publicIP });
  res.status(200).json(liveMatch);
});

module.exports = router;
