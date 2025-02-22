const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The user who is reporting
  reportedId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Can be a Post or User
  reportedType: { type: String, enum: ["Post", "User"], required: true }, // Specifies what is being reported
  dontWantToSee: { 
    type: String, 
    enum: [
      "I'm not interested in the author", 
      "I'm not interested in this topic", 
      "I've seen too many posts on this topic", 
      "I've seen this post before", 
      "This post is old", 
      "It's something else"
    ] 
  },
  policy: { 
    type: String, 
    enum: [
      // General content violations
      "Harassment", 
      "Fraud or scam", 
      "Spam", 
      "Misinformation", 
      "Hateful speech", 
      "Threats or violence", 
      "Self-harm", 
      "Graphic content", 
      "Dangerous or extremist organizations", 
      "Sexual content", 
      "Fake account", 
      "Child exploitation", 
      "Illegal goods and services", 
      "Infringement",
      // User-specific violations
      "This person is impersonating someone", 
      "This account has been hacked", 
      "This account is not a real person"
    ], 
    required: true 
  }
}, { timestamps: true }); // Adds createdAt & updatedAt automatically

module.exports = mongoose.model("Report", reportSchema);