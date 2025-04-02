const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema({
    // Core relationships
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },

    // Application status
    status: {
        type: String,
        enum: ["pending", "viewed", "rejected", "accepted"],
        default: "pending"
    },

    // Contact information
    contactEmail: {
        type: String,
        required: true
    },
    contactPhone: {
        type: String,
        required: false
    },
    // Screening question responses
    // This is a dynamic structure that stores responses to job-specific screening questions
    screeningAnswers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false // Could be a simple string question without an ID
        },
        question: {
            type: String,
            required: true
        },
        questionType: {
            type: String,
            enum: [
                "Background Check", "Driver's License", "Drug Test", "Education",
                "Expertise with Skill", "Hybrid Work", "Industry Experience", "Language",
                "Location", "Onsite Work", "Remote Work", "Urgent Hiring Need",
                "Visa Status", "Work Authorization", "Work Experience", "Custom Question"
            ]
        },
        answer: {
            type: String,
            required: true
        },
        meetsCriteria: {
            type: Boolean,
            default: null // Will be determined when application is processed
        }
    }],

    // Rejection details
    rejectionReason: {
        type: String,
        default: null
    },
    autoRejected: {
        type: Boolean,
        default: false
    },

    // Activity tracking
    lastViewed: {
        type: Date,
        default: null
    }
}, { timestamps: true }); // Adds createdAt & updatedAt timestamps

// Create compound index to prevent duplicate applications
jobApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);