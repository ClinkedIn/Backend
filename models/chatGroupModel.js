const mongoose = require("mongoose");

const chatGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }], // Array of user IDs
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("ChatGroup", chatGroupSchema);
