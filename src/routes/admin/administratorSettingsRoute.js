const express = require("express");
const GeneralSettings = require("../../models/GeneralSetting");
const { exclude } = require("../../utils");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const generalSettingSchema = await GeneralSettings.findOne();

    let responseData = null;

    if (generalSettingSchema) {
      responseData = exclude(generalSettingSchema.toObject(), ["_id", "__v", "createdAt", "updatedAt"]);
    }

    res.status(200).json({
      status: true,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
});

router.post("/update", async (req, res, next) => {
  try {
    const generalSettingSchema = await GeneralSettings.findOne();
    const {
      company_name,
      site_title,
      timezone,
      language,
      facebook,
      youtube,
      instagram,
      site_logo,
      site_icon,
      terms,
      policy,
      android_download_link,
      ios_download_link,
      days_news,
      days_highlight,
      allowedCountries
    } = req.body;

    if (generalSettingSchema) {
      generalSettingSchema.company_name = company_name;
      generalSettingSchema.site_title = site_title;
      generalSettingSchema.terms = terms;
      generalSettingSchema.policy = policy;
      generalSettingSchema.timezone = timezone;
      generalSettingSchema.language = language;
      generalSettingSchema.facebook = facebook;
      generalSettingSchema.youtube = youtube;
      generalSettingSchema.instagram = instagram;
      generalSettingSchema.site_logo = site_logo;
      generalSettingSchema.site_icon = site_icon;
      generalSettingSchema.android_download_link = android_download_link;
      generalSettingSchema.ios_download_link = ios_download_link;
      generalSettingSchema.days_news = days_news;
      generalSettingSchema.days_highlight = days_highlight;
      generalSettingSchema.allowedCountries = allowedCountries;

      const updatedData = await generalSettingSchema.save();

      res.status(200).json({
        status: true,
        data: updatedData
      });
    } else {
      const administrationSettings = new GeneralSettings({
        company_name,
        site_title,
        timezone,
        language,
        facebook,
        youtube,
        instagram,
        site_logo,
        site_icon,
        terms,
        policy,
        android_download_link,
        ios_download_link,
        allowedCountries
      });

      await administrationSettings.save();

      res.status(200).json({
        status: true,
        data: administrationSettings
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
