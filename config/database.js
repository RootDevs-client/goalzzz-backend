const mongoose = require("mongoose");
require("dotenv").config();

const connectToDatabase = async () => {
  const databaseURL = process.env.DATABASE_URI;

  try {
    await mongoose.connect(databaseURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to MongoDB Database");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

module.exports = connectToDatabase;
