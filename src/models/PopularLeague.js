const mongoose = require("mongoose");
const popularLeagueSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: {
      type: String,
      unique: true
    },
    image_path: {
      type: String
    },
    country: {
      type: String
    },
    current_season: {
      type: String
    },
    show_point_table: {
      type: Number,
      default: 0
    },
    newsUrl: { type: String },
    channelId: { type: String },
    position: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const PopularLeague = mongoose.model("PopularLeague", popularLeagueSchema);

module.exports = PopularLeague;
