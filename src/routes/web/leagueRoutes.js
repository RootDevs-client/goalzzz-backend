const express = require("express");
const { getTopLeagues, getSelectedPointTable } = require("../../controllers/web/leagueController");
const router = express.Router();

router.get("/top-leagues", async (req, res) => {
  const topLeagues = await getTopLeagues();
  res.status(200).json(topLeagues);
});

router.get("/selected-point-table", async (req, res) => {
  const selectedPointTable = await getSelectedPointTable();
  res.status(200).json(selectedPointTable);
});

module.exports = router;
