const axios = require("axios");

const sportMonkslUrl = axios.create({
  baseURL: process.env.SPORTMONKS_URL,
  timeout: 30000,
  headers: {
    "content-type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    token: process.env.SPORTMONKS_API_TOKEN
  }
  // params: {
  //   api_token: process.env.SPORTMONKS_API_TOKEN,
  // },
});

module.exports = { sportMonkslUrl };
