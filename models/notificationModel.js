const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Sender of the notification
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Receiver of the notification
  subject: { 
    type: String, 
    enum: ["like", "comment", "connection request", "message"], 
    required: true 
  }, // Type of notification
  text: { type: String, required: true }, // Notification message
  isRead: { type: Boolean, default: false } // Mark as read/unread
}, { timestamps: true }); // Adds createdAt & updatedAt timestamps

module.exports = mongoose.model("Notification", notificationSchema);