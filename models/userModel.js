const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const { PhoneModule } = require('@faker-js/faker');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: null },
    coverPicture: { type: String, default: null },
    resume: { type: String, default: null },
    website: { type: String, default: null },
    contactInfo:{
        phone: { type: String, default: null },
        phoneType: { type: String, enum:["Home", "Work", "Mobile"],default: null },
        address: { type: String, default: null },
        birthDay:  {
            day: { type: Number, default: null },
            month: { type: String, enum:["January", "February", "March", "April","May", "June", "July", "August", "September", "October", "November", "December"],
                 default: null },
        },
        website: { url: { type: String, default: null }, type: { type: String,enum:["Personal", "Company", "Blog","RSS Feed", "Portfolio","Other"] ,default: null } },
    },
    additionalName: { type: String, default: null },
    headline: { type: String, default: null },
    bio: { type: String, default: null },
    location: { type: String,default: null },
    lastJobTitle: { type: String, default: null },
    industry: { type: String, default: null },
    certificates: [{ type: String }],
    workExperience: [{
        jobTitle: { type: String, required: true },
        companyName: { type: String, required: true },
        fromDate: { type: Date, required: true },
        toDate: { type: Date },
        currentlyWorking: {type: Boolean},
        employmentType: { type: String, enum: ["Full Time", "Part Time", "Freelance", "Self Employed", "Contract", "Internship", "Apprenticeship", "Seasonal"], required: true },
        location: { type: String },
        locationType: { type: String, enum: ["Onsite", "Hybrid", "Remote"] },
        description: { type: String },
        foundVia: { type: String, enum: ["Indeed", "LinkedIn", "Company Website", "Other job sites", "Referral", "Contracted by Recruiter", "Staffing Agency", "Other"] },
        skills: [{ type: String }],
        media: { type: String }
    }],
    mainEducation: {
        type: Number,  // Index of the education in the education array
        default: null,    // First education entry is default
    },
    skills: [{
        skillName: { type: String, required: true },
        endorsements: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    }],

    education: [{
        school: { type: String, required: true },
        degree: { type: String },
        fieldOfStudy: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        grade: { type: String },
        activities: { type: String },
        description: { type: String },
        skills: [{ type: String }],
        media: { type: String }
    }],
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subscription" }],
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", default: null },
    isPremium: { type: Boolean, default: false },
    companies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
    adminInCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
    isSuperAdmin: { type: Boolean, default: false },
    profilePrivacySettings: { type: String, enum: ["public", "private", "connectionsOnly"], default: "public" },
    connectionRequestPrivacySetting: { type: String, enum: ["everyone", "connectionsOnly"], default: "everyone" },
    impressions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Impression" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    reposts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Repost" }],
    following: [{
        entity: { type: mongoose.Schema.Types.ObjectId, refPath: 'following.entityType' },
        entityType: { type: String, enum: ['User', 'Company'] },
        followedAt: { type: Date, default: Date.now }
    }],
    followers: [{
        entity: { type: mongoose.Schema.Types.ObjectId, refPath: 'followers.entityType' },
        entityType: { type: String, enum: ['User', 'Company'] },
        followedAt: { type: Date, default: Date.now }
    }],
    connectionList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    profileViews: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    isConfirmed: { type: Boolean, default: false },
    appliedJobs: [{
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
        status: { type: String, enum: ["pending", "viewed", "rejected", "accepted"], default: "pending" }
    }],
    sentConnectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    receivedConnectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messageRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    chats: [{
        chatId: { type: mongoose.Schema.Types.ObjectId, refPath: 'chats.chatType' },
        chatType: { type: String, enum: ['DirectChat', 'ChatGroup'] },
        unreadCount: { type: Number, default: 0 },
        lastReadAt: { type: Date }
    }],
    defaultMode: { type: String, enum: ["light", "dark"], default: "light" },
    googleId: { type: String, default: null },
    fcmToken: { type: String },

    emailVerificationToken: { type: String, default: null },
    emailVerificationExpiresAt: { type: Date },
    passwordResetToken: { type: String, default: null },
    passwordResetExpiresAt: { type: Date },

    isActive: { type: Boolean, default: true }
}, { timestamps: true }); // Adds createdAt & updatedAt automatically
module.exports = mongoose.model('User', userSchema);


