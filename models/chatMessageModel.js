const mongoose = require("mongoose");
const chatMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who sent the message
  chatId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Can be either DirectChat or ChatGroup
  type: { type: String, enum: ["direct", "group"], required: true }, // Type of chat
  messageText: { type: String },
  messageAttachment: {
        type: [String], // Change from String to [String] to make it an array of strings
        default: []
    }, // Can be a file URL or path
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who have read the message
  timeStamp: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "ChatMessage" } // References another message if it's a reply
}, { timestamps: true });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);