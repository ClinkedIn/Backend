const mongoose = require("mongoose");
const repostSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    description: { type: String },
    taggedUsers: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      userType: { type: String, enum: ["User", "Company"], default: "User" },
      firstName: { type: String },
      lastName: { type: String },
      companyName: { type: String },
    }],
    isActive: { type: Boolean, default: true }
  }, { timestamps: true }); // Adds createdAt & updatedAt automatically
  
  module.exports = mongoose.model("Repost", repostSchema);