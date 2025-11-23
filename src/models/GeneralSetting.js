const mongoose = require("mongoose");

const generalSettingSchema = new mongoose.Schema(
  {
    company_name: { type: String },
    site_title: { type: String },
    terms: { type: String },
    policy: { type: String },
    android_download_link: { type: String },
    ios_download_link: { type: String },
    timezone: { type: Object },
    language: { type: Object },
    facebook: { type: String, default: "" },
    youtube: { type: String, default: "" },
    instagram: { type: String, default: "" },
    site_logo: { type: String, default: "" },
    site_icon: { type: String, default: "" },
    days_news: { type: Number, default: 0 },
    days_highlight: { type: Number, default: 0 },
    allowedCountries: {
      type: [
        {
          value: { type: String, required: true },
          label: { type: String, required: true },
          flag: { type: String, required: true },
          dialCode: { type: String, required: true }
        }
      ],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const GeneralSettings = mongoose.model("GeneralSettings", generalSettingSchema);

module.exports = GeneralSettings;
