const mongoose = require("mongoose");

const impressionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}, // User who interacted
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Can be post or comment
  targetType: { 
    type: String, 
    enum: ["Post", "Comment"], 
    required: true 
  }, // Specifies the target type (post or comment)
  type: {
    type: String,
    enum: ["like", "support", "celebrate", "love", "insightful","funny"], // Define interaction types
    required: true,
  },
}, { timestamps: true });

// Dynamic reference based on targetType
// impressionSchema.virtual("target", {
//   ref: doc => doc.targetType, // Reference dynamically based on targetType
//   localField: "targetId",
//   foreignField: "_id",
//   justOne: true,
// });
impressionSchema.index({ userId: 1, targetId: 1 });
impressionSchema.index({userId:1});
impressionSchema.index({targetId:1});
module.exports = mongoose.model("Impression", impressionSchema);