const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    commentContent: { type: String, default: "" },
    commentAttachment: { type: String },
    taggedUsers: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      userType: { type: String, enum: ["User", "Company"], default: "User" },
      firstName: { type: String },
      lastName: { type: String },
      companyName: { type: String },
    }],
    impressions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Impression" }],
    impressionCounts: {
      like: { type: Number, default: 0 },
      support: { type: Number, default: 0 },
      celebrate: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      insightful: { type: Number, default: 0 },
      funny: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    replyCount: { type: Number, default: 0 },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }, // Self-reference for nested comments
    isActive: { type: Boolean, default: true }
  }, { timestamps: true }); // Adds createdAt & updatedAt automatically
commentSchema.index({ userId: 1, postId: 1 });
commentSchema.index({ postId: 1 });
commentSchema.index({ userId: 1 });
module.exports = mongoose.model("Comment", commentSchema);