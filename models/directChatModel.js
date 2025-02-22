const mongoose = require("mongoose");
const directChatSchema = new mongoose.Schema({
    firstUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    secondUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  }, { timestamps: true });
  
  module.exports = mongoose.model("DirectChat", directChatSchema);
  