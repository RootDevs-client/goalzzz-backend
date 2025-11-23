const mongoose = require("mongoose");

const highlightSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    short_description: {
      type: String,
    },
    video_type: {
      type: String,
      required: true,
    },
    youtube_url: {
      type: String,
    },
    thumbnail_type: {
      type: String,
    },
    highlight_image: {
      type: String,
    },
    fixture_id: {
      type: String,
    },
    videos: {
      type: [String],
    },
    status: {
      type: String,
      default: "1",
    },
  },
  {
    timestamps: true,
  }
);

const highlight = mongoose.model("Highlight", highlightSchema);

module.exports = highlight;
