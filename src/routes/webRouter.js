const express = require("express");
const router = express.Router();
const userRoutes = require("./web/userRoutes");
const leagueRoutes = require("./web/leagueRoutes");
const liveMatchRoutes = require("./web/liveMatchRoutes");
const newsRoutes = require("./web/newsRoutes");
const highlightRoutes = require("./web/highlightRoutes");
const subscriptionRoutes = require("./web/subscriptionRoutes");
const blackListRoute = require("./web/blackListRoute");
const paymentRoute = require("./web/paymentRoute");
const administratorSettingsRoute = require("./admin/administratorSettingsRoute");

// Web Routes
router.use("/user", userRoutes);
router.use("/league", leagueRoutes);
router.use("/live-matches", liveMatchRoutes);
router.use("/news", newsRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/highlights", highlightRoutes);
router.use("/black-list", blackListRoute);
router.use("/payment", paymentRoute);
router.use("/general-settings", administratorSettingsRoute);

module.exports = router;
