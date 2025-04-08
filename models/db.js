require("dotenv").config();
const process = require("process");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // const uri = "mongodb://localhost:27017/LockedIn";
    const uri = process.env.MONGODB_CONNECTION || "mongodb://0.0.0.0:27017/LockedIn";
    await mongoose.connect(uri);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
