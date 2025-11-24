require("dotenv").config();

const config = {
  development: {
    corsOptions: {
      origin: ["http://localhost:3000", process.env.CORS_ORIGINS],
      credentials: true
    },
    databaseURI: process.env.DEV_DATABASE_URL, // Use DEV_DATABASE_URL from .env
    port: process.env.PORT || 8000, // Use PORT from .env or default to 8080
    apiKey: process.env.API_KEY, // Use API_KEY from .env
    appSecret: process.env.APP_SECRET // Use APP_SECRET from .env
  },
  production: {
    corsOptions: {
      origin: [process.env.CORS_ORIGINS, "https://www.windfootball.xyz", "https://xoom-sports-v3.vercel.app"],
      credentials: true
    },
    databaseURI: process.env.PROD_DATABASE_URL, // Use PROD_DATABASE_URL from .env
    port: process.env.PORT || 8000, // Use PORT from .env or default to 8080
    apiKey: process.env.API_KEY, // Use API_KEY from .env
    appSecret: process.env.APP_SECRET // Use APP_SECRET from .env
  }
};

module.exports = config;
