const { body, param } = require("express-validator");
const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const PopularLeague = require("../../models/PopularLeague");

const validateCreateLeague = [
  body("name").notEmpty().withMessage("Name is required"),
  body("id").notEmpty().withMessage("League ID is required")
];

const validateSingleLeague = [param("id").notEmpty().withMessage("League ID is required")];

// Get all Leagues
router.get("/", async (req, res, next) => {
  try {
    const popularLeague = await PopularLeague.find().sort({
      position: "asc"
    });

    res.status(200).json({
      status: true,
      message: popularLeague.length === 0 ? "No Popular Leagues found!" : "Popular Leagues fetched successfully!",
      data: popularLeague
    });
  } catch (error) {
    next(error);
  }
});

// Update a Popular league
router.patch("/:id", validateSingleLeague, async (req, res, next) => {
  try {
    const updatedSelectedLeague = await PopularLeague.findByIdAndUpdate(
      req.params.id,
      {
        id: req.body.id,
        current_season: req.body.current_season,
        name: req.body.name,
        country: req.body?.country,
        image_path: req.body.image_path,
        status: req.body.status || "1",
        newsUrl: req.body.newsUrl || "",
        channelId: req.body.channelId || "",
        position: req.body.position,
        show_point_table: req.body?.show_point_table
      },
      { new: true }
    );

    if (!updatedSelectedLeague) {
      console.log({ id: req.params.id });
      return res.status(404).json({ status: false, message: "Selected league not found" });
    }

    res.json({ status: true, message: "Selected leagues Updated", data: updatedSelectedLeague });
  } catch (error) {
    console.log("error", error);
    next(error);
  }
});

// Create a League
router.post("/create", validateCreateLeague, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    }

    const { name, id, image_path, country, current_season } = req.body;

    const existingLeagues = await PopularLeague.findOne({
      $or: [{ id: id }, { name: name }]
    });

    if (existingLeagues) {
      return res.status(200).json({
        status: false,
        message: "This league already added!"
      });
    }

    const popularLeague = new PopularLeague({
      name,
      id,
      image_path,
      country,
      current_season
    });

    const savedLeague = await popularLeague.save();

    res.status(201).json({
      status: true,
      message: "League Added successfully!",
      data: savedLeague
    });
  } catch (error) {
    next(error);
  }
});

// Update Point Table
router.post("/update/select-point-table", async (req, res, next) => {
  try {
    const { id } = req.body;

    await PopularLeague.updateMany({}, { show_point_table: 0 });

    await PopularLeague.updateOne(
      {
        id: id
      },
      {
        show_point_table: 1
      }
    );

    res.status(201).json({
      status: true,
      message: "Select point table successfully!"
    });
  } catch (error) {
    next(error);
  }
});

// Sort Popular League
router.post("/sort", async (req, res, next) => {
  try {
    const leagueWithPosition = req.body;

    await Promise.all(
      leagueWithPosition.map(async singleLeague => {
        const league = await PopularLeague.findOne({ id: singleLeague.id });
        league.position = singleLeague.position;
        await league.save();

        return league;
      })
    );

    return res.status(200).json({
      status: true,
      message: "Popular League Sorted Successfully!"
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Delete League by ID
router.delete("/:id", validateSingleLeague, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedLeague = await PopularLeague.deleteOne({
      id: id
    });

    if (!deletedLeague) {
      return res.status(404).json({ status: false, message: "League not found!" });
    }

    res.status(200).json({
      status: true,
      message: "League removed successfully!"
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
