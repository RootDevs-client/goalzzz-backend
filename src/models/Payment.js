const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    trxnId: {
      type: String,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: [
        "pending",
        "completed",
        "failed",
        "cancelled",
        "expired",
        "declined",
      ],
      default: "pending",
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
