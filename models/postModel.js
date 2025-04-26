const mongoose = require("mongoose");
const userModel = require("./userModel");
const { instanceId } = require("firebase-admin");

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who created the post
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  description: { type: String, required: true },
  attachments: [{ type: String }], // Allow multiple pictures but only one video
  taggedUsers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userType: { type: String, enum: ["User", "Company"], default: "User" },
    firstName: { type: String },
    lastName: { type: String },
    companyName: { type: String },
  }],
  impressions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Impressions" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  reposts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Repost" }],

  // Add counter fields for quick access
  impressionCounts: {
    like: { type: Number, default: 0 },
    support: { type: Number, default: 0 },
    celebrate: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    insightful: { type: Number, default: 0 },
    funny: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  commentCount: { type: Number, default: 0 },
  repostCount: { type: Number, default: 0 },
  whoCanSee: { type: String, enum: ["anyone", "connections"], default: "anyone" },
  whoCanComment: { type: String, enum: ["anyone", "connections", "noOne"], default: "anyone" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true }); // Adds createdAt & updatedAt automatically
postSchema.index({ userId: 1});
module.exports = mongoose.model("Post", postSchema);