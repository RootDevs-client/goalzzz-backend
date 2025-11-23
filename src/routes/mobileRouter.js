const express = require("express");
const router = express.Router();
const manageSettings = require("./mobile/manageSettings");
const liveMatches = require("./mobile/liveMatches");
const streamingSources = require("./mobile/streamingSources");

// Mobile Routes
router.use("/settings", manageSettings);
router.use("/live_matches", liveMatches);
router.use("/streaming_sources", streamingSources);
router.post("/ip", (req, res) => {
  const publicIP =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "";

  res.send(publicIP);
});

module.exports = router;
