const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    duration_type: {
      type: String,
      enum: ["day", "week", "month", "year"],
    },
    duration: {
      type: Number,
    },
    price: {
      type: Number,
    },
    status: {
      type: String,
      default: "1",
    },
    descriptions: {
      type: [String],
    },
    currency: {
      type: String,
      default: "USD"
    },
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
