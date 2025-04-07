const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Sender of the notification
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Receiver of the notification
    subject: {
      type: String,
      enum: [
        "impression",
        "comment",
        "connection request",
        "message",
        "follow",
        "post",
      ],
      required: true,
    }, // Type of notification
    title: { type: String, required: true }, // Title of the notification
    content: { type: String, required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false }, // Mark as read/unread
  },
  { timestamps: true }
); // Adds createdAt & updatedAt timestamps

module.exports = mongoose.model("Notification", notificationSchema);
