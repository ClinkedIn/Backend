const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    commentContent: { type: String, required: true },
    commentAttachment: { type: String },
    impressions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Impression" }],
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }, // Self-reference for nested comments
    isActive: { type: Boolean, default: true }
  }, { timestamps: true }); // Adds createdAt & updatedAt automatically
  
  module.exports = mongoose.model("Comment", commentSchema);