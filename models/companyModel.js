const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Company creator
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users following the company
  name: { type: String, required: true },
  address: { type: String, required: true, unique: true }, // Unique LinkedIn-style URL
  website: { type: String },
  industry: { type: String },
  organizationSize: {
    type: String,
    enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5000+"],
  }, // Predefined company sizes
  organizationType: {
    type: String,
    enum: ["Public", "Private", "Nonprofit", "Government", "Educational", "Self-employed"],
  }, // Company type
  logo: { type: String }, // URL to company logo
  tagLine: { type: String }, // Short company description
  visitors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who visited the profile
}, { timestamps: true }); // Adds createdAt & updatedAt timestamps

module.exports = mongoose.model("Company", companySchema);
