const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    phone: {
      type: String,
      unique: true
    },
    paid: {
      type: Boolean,
      default: false
    },
    rawPassword: {
      type: String,
      select: false
    },
    stripeCustomerId: {
      type: String,
      default: "",
      select: false
    },
    subscription: {
      type: mongoose.Types.ObjectId,
      ref: "Subscription"
    },
    membershipPlan: {
      type: String
    },
    expiresAt: {
      type: Number
    },
    SubscribedAt: {
      type: String
    },
    reference: {
      type: String
    },
    paymentMethod: {
      type: String,
      default: "",
      select: false
    },
    subscriptionId: {
      type: String,
      default: "",
      select: false
    },
    isPassExist: {
      type: Boolean,
      default: true
    },
    email: {
      type: String
    },
    password: String,
    image: {
      type: String,
      default: null
    },
    role: {
      type: String,
      default: "user"
    },
    status: {
      type: String,
      default: "1"
    },
    verify_code: {
      type: String,
      default: null
    },
    email_verified: {
      type: Number,
      default: 0
    },
    provider: String,
    forget_code: {
      type: String,
      default: null
    },
    token: String,
    salt: String,
    favorites: {
      teams: [
        {
          type: mongoose.Schema.Types.Mixed
        }
      ],
      leagues: [
        {
          type: mongoose.Schema.Types.Mixed
        }
      ],
      matches: [
        {
          type: mongoose.Schema.Types.Mixed
        }
      ]
    }
  },
  {
    timestamps: true,
    strict: true // Enforce strict validation
  }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.salt;
  delete obj.subscriptionId;
  delete obj.stripeCustomerId;
  delete obj.verify_code;
  delete obj.isPassExist;
  delete obj.provider;
  delete obj.forget_code;
  delete obj.rawPassword;
  delete obj.__v;
  return obj;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
