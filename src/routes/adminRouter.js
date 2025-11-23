const express = require("express");
const router = express.Router();
const adminRoutes = require("./admin/adminRoutes");
const administratorSettingsRoute = require("./admin/administratorSettingsRoute");
const uploadImageRoutes = require("./uploadImageRoutes");
const newsRoutes = require("./admin/newsRoutes");
const subscriptionRoutes = require("./admin/subscriptionRoutes");
const manageAppRoutes = require("./admin/manageAppRoutes");
const adsTypeRoutes = require("./admin/adsTypeRoutes");
const appSettingsRoute = require("./admin/appSettingsRoute");
const matchRoutes = require("./admin/matchRoutes");
const notificationRoutes = require("./admin/notificationRoutes");
const leaguesRoutes = require("./admin/leaguesRoutes");
const popularLeagueRoutes = require("./admin/popularLeagueRoutes");
const fixtureRoutes = require("./admin/fixtureRoutes");
const highlightRoutes = require("./admin/highlightRoutes");
const userRoutes = require("./admin/userRoutes");
const { userAuth } = require("../middlewares/userAuth");

// Admin Routes
router.use("/", adminRoutes);
router.use("/users", userRoutes);
router.use("/image", uploadImageRoutes);
router.use("/news", userAuth, newsRoutes);
router.use("/matches", matchRoutes);
router.use("/notifications", notificationRoutes);
router.use("/fixtures", fixtureRoutes);
router.use("/administration-settings", administratorSettingsRoute);
router.use("/popular-leagues", userAuth, popularLeagueRoutes);
router.use("/subscriptions", userAuth, subscriptionRoutes);
router.use("/highlights", highlightRoutes);

router.use("/leagues", leaguesRoutes);
router.use("/apps", userAuth, manageAppRoutes);
router.use("/ads", adsTypeRoutes);
router.use("/app-settings", appSettingsRoute);

module.exports = router;
