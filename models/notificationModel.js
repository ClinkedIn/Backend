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
    content: { type: String, required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    relatedPostId: { type: mongoose.Schema.Types.ObjectId, default: undefined }, // ID of the related post (if applicable)
    relatedCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: undefined,
    }, // ID of the related comment (if applicable)
    isRead: { type: Boolean, default: false }, // Mark as read/unread
    isDeleted: { type: Boolean, default: false }, // Mark as deleted
  },
  { timestamps: true }
); // Adds createdAt & updatedAt timestamps

module.exports = mongoose.model("Notification", notificationSchema);
