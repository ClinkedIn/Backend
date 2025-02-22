const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Could be company ID
    description: { type: String,required: true },
    attachments: [{ type: String }], // Allow multiple pictures but only one video
    taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true }
  }, { timestamps: true }); // Adds createdAt & updatedAt automatically
  
  module.exports = mongoose.model("Post", postSchema);