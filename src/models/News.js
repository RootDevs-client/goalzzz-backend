const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String
    },
    slug: {
      type: String
    },
    image: {
      type: String
    },
    description: {
      type: String
    },
    publish_date: {
      type: String
    },
    status: {
      type: String,
      default: "1"
    }
  },
  {
    timestamps: true
  }
);

const News = mongoose.model("News", newsSchema);

module.exports = News;
