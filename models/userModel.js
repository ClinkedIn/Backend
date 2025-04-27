const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { PhoneModule } = require("@faker-js/faker");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: false },
    profilePicture: { type: String, default: null },
    coverPicture: { type: String, default: null },
    resume: { type: String, default: null },
    website: { type: String, default: null },
    contactInfo: {
      phone: { type: String, default: "" },
      phoneType: {
        type: String,
        enum: ["Home", "Work", "Mobile"],
        default: "Home",
      },
      address: { type: String, default: "" },
      birthDay: {
        day: { type: Number, default: 1 },
        month: {
          type: String,
          enum: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ],
          default: "January",
        },
      },
      website: {
        url: { type: String, default: null },
        type: {
          type: String,
          enum: [
            "Personal",
            "Company",
            "Blog",
            "RSS Feed",
            "Portfolio",
            "Other",
          ],
          default: null,
        },
      },
    },
    additionalName: { type: String, default: null },
    headline: { type: String, default: null },
    about: {
      description: { type: String, default: null },
      skills: {
        type: [{ type: String, default: null }],
        validate: [
          function (val) {
            return val.length <= 5;
          },
          "Skills array cannot contain more than 5 items",
        ],
      },
    },
    location: { type: String, default: null },
    lastJobTitle: { type: String, default: null },
    industry: { type: String, default: null },
    certificates: [{ type: String }],
    workExperience: [
      {
        jobTitle: { type: String, required: true },
        companyName: { type: String, required: true },
        fromDate: { type: Date, required: true },
        toDate: { type: Date },
        currentlyWorking: { type: Boolean },
        employmentType: {
          type: String,
          enum: [
            "Full Time",
            "Part Time",
            "Freelance",
            "Self Employed",
            "Contract",
            "Internship",
            "Apprenticeship",
            "Seasonal",
          ],
          required: true,
        },
        location: { type: String },
        locationType: { type: String, enum: ["Onsite", "Hybrid", "Remote"] },
        description: { type: String },
        foundVia: {
          type: String,
          enum: [
            "Indeed",
            "LinkedIn",
            "Company Website",
            "Other job sites",
            "Referral",
            "Contracted by Recruiter",
            "Staffing Agency",
            "Other",
          ],
        },
        skills: [{ type: String }],
        media: { type: String },
      },
    ],
    mainEducation: {
      type: Number, // Index of the education in the education array
      default: null, // First education entry is default
    },
    skills: {
      type: [
        {
          skillName: { type: String, required: true },
          endorsements: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
          education: { type: [Number], default: [] },
          experience: { type: [Number], default: [] },
        },
      ],
      default: [],
    },

    education: [
      {
        school: { type: String, required: true },
        degree: { type: String },
        fieldOfStudy: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        grade: { type: String },
        activities: { type: String },
        description: { type: String },
        skills: [{ type: String }],
        media: { type: String },
      },
    ],
    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
    ],
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
    isPremium: { type: Boolean, default: false },
    companies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
    adminInCompanies: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    ],
    isSuperAdmin: { type: Boolean, default: false },
    profilePrivacySettings: {
      type: String,
      enum: ["public", "private", "connectionsOnly"],
      default: "public",
    },
    connectionRequestPrivacySetting: {
      type: String,
      enum: ["everyone", "mutual"],
      default: "everyone",
    },
    impressions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Impression" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    reposts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Repost" }],
    following: [
      {
        entity: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "following.entityType",
        },
        entityType: { type: String, enum: ["User", "Company"] },
        followedAt: { type: Date, default: Date.now },
      },
    ],
    followers: [
      {
        entity: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "followers.entityType",
        },
        entityType: { type: String, enum: ["User", "Company"] },
        followedAt: { type: Date, default: Date.now },
      },
    ],
    connectionList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedFromMessaging: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reportedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    profileViews: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    isConfirmed: { type: Boolean, default: false },
    sentConnectionRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    receivedConnectionRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    messageRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    chats: [
      {
        chatId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "chats.chatType",
        },
        chatType: { type: String, enum: ["DirectChat", "ChatGroup"] },
        unreadCount: { type: Number, default: 0 },
        lastReadAt: { type: Date },
        muted: { type: Boolean, default: false },
        archived: { type: Boolean, default: false },
        starred: { type: Boolean, default: false },
      },
    ],
    defaultMode: { type: String, enum: ["light", "dark"], default: "light" },
    googleId: { type: String, default: null },
    fcmToken: { type: [String], default: [] },
    emailVerificationOTP: { type: String, default: undefined },
    emailVerificationOTPExpiresAt: { type: Date, default: undefined },
    passwordResetOTP: { type: String, default: undefined },
    passwordResetOTPExpiresAt: { type: Date, default: undefined },
    isActive: { type: Boolean, default: true },
    notificationPauseExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
); // Adds createdAt & updatedAt automatically

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);

  next();
});

userSchema.pre("/^find/", function (next) {
  this.find({ isActive: true });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.passwordResetOTP = crypto.createHash("sha256").update(otp).digest("hex");

  this.passwordResetOTPExpiresAt = Date.now() + 10 * 60 * 1000;

  return otp;
};

userSchema.methods.createEmailVerificationOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  this.emailVerificationOTPExpiresAt = Date.now() + 10 * 60 * 1000;

  return otp;
};

module.exports = mongoose.model("User", userSchema);
