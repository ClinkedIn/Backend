const mongoose = require("mongoose");
const directChatSchema = new mongoose.Schema({
    firstUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    secondUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatMessage" }] // should be sorted by creation date
  }, { timestamps: true });
  
  module.exports = mongoose.model("DirectChat", directChatSchema);
  