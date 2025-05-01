const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true }, // Company offering the job
  workplaceType: {
    type: String,
    enum: ["Onsite", "Hybrid", "Remote"],
    required: true,
  }, // Work location type
  title: { type: String, required: true }, // Job title
  industry: { type: String, required: true }, // Industry of the job
  jobLocation: { type: String, required: true }, // Location of the job
  jobType: {
    type: String,
    enum: ["Full Time", "Part Time", "Contract", "Temporary", "Other", "Volunteer", "Internship"],
    required: true,
  }, // Job classification
  description: { type: String, required: true }, // Job details
  applicationEmail: { type: String, required: true }, // Email for job applications
  screeningQuestions: [
    {
      question: {
        type: String,
        required: true,
        enum: [
          "Background Check", "Driver's License", "Drug Test", "Education",
          "Expertise with Skill", "Hybrid Work", "Industry Experience", "Language",
          "Location", "Onsite Work", "Remote Work", "Urgent Hiring Need",
          "Visa Status", "Work Authorization", "Work Experience", "Custom Question"
        ],
      }, // Screening question
      specification: { type: String }, // Includes jobFunction/Skill name etc... depending on the question
      idealAnswer: { type: String }, // Ideal(minimum) answer for the question
      mustHave: { type: Boolean, default: false }, // Must-have requirement
    },
  ],
  autoRejectMustHave: { type: Boolean, default: false }, // Auto-reject if must-have not met
  rejectPreview: { type: String }, // Message for rejected applicants
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who applied
  accepted: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users accepted
  rejected: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users rejected
  isActive: { type: Boolean, default: true }, // Job status
  isFlagged: { type: Boolean, default: false }, // Job status
}, { timestamps: true }); // Adds createdAt & updatedAt timestamps
jobSchema.index({ companyId: 1 }); // Index for quick access to jobs by company
module.exports = mongoose.model("Job", jobSchema);
