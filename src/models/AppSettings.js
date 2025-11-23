const mongoose = require("mongoose");

// Define valid popup time values
const PopupTimeEnum = [10, 20, 30, 60, 90, 120];
const PopupDurationEnum = [1, 2, 3, 4, 5];

const appSettingSchema = new mongoose.Schema(
  {
    jw_player: {
      player_id: {
        type: String,
        required: true,
        trim: true
      },
      player_logo: {
        type: String,
        required: true,
        trim: true
      }
    },
    popup: {
      guest_popup_time: {
        type: Number,
        enum: PopupTimeEnum,
        default: 10
      },
      guest_popup_duration: {
        type: Number,
        enum: PopupDurationEnum,
        default: 3
      },
      login_popup_time: {
        type: Number,
        enum: PopupTimeEnum,
        default: 10
      },
      login_popup_duration: {
        type: Number,
        enum: PopupDurationEnum,
        default: 3
      }
    }
  },
  {
    timestamps: true
  }
);

const AppSettings = mongoose.model("AppSettings", appSettingSchema);

module.exports = AppSettings;
