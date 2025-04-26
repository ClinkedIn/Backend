const userModel = require("../models/userModel");
const reportModel = require("../models/reportModel");
const postModel = require("../models/postModel");
const mongoose = require("mongoose");
const customError = require("../utils/customError");


const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const loggedInUserId = req.user.id;

        if (userId === loggedInUserId) {
            return res.status(400).json({ message: "You cannot block yourself." });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        const userToBlock = await userModel.findById(userId);
        if (!userToBlock) {
            return res.status(404).json({ message: "User not found." });
        }

        await userModel.findByIdAndUpdate(loggedInUserId, { $addToSet: { blockedUsers: userId } });

        return res.status(200).json({ message: "User blocked successfully." });
    }
    catch (error) {
        console.error("Error blocking user:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}


const unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const loggedInUserId = req.user.id;

        if (userId === loggedInUserId) {
            return res.status(400).json({ message: "You cannot unblock yourself." });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        const userToUnblock = await userModel.findById(userId);
        if (!userToUnblock) {
            return res.status(404).json({ message: "User not found." });
        }

        await userModel.findByIdAndUpdate(loggedInUserId, { $pull: { blockedUsers: userId } });

        return res.status(200).json({ message: "User unblocked successfully." });
    }
    catch (error) {
        console.error("Error unblocking user:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

const reportUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const loggedInUserId = req.user.id;
        const { policy, dontWantToSee } = req.body;
        // ensure policy is one of the allowed values
        const allowedPolicies = [
            "This person is impersonating someone", 
            "This account has been hacked", 
            "This account is not a real person"
        ]

        if (!allowedPolicies.includes(policy)) {
            return res.status(400).json({ message: "Invalid policy." });
        }

        if (userId === loggedInUserId) {
            return res.status(400).json({ message: "You cannot report yourself." });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        const userToReport = await userModel.findById(userId);
        if (!userToReport) {
            return res.status(404).json({ message: "User not found." });
        }

        const updatedUser = await userModel.findOneAndUpdate(
            { 
                _id: loggedInUserId,
                reportedUsers: { $ne: userId }
            },
            { 
                $addToSet: { reportedUsers: userId } 
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ message: "You have already reported this user." });
        }

        const newReport = new reportModel({
            userId: loggedInUserId,
            reportedId: userId,
            reportedType: "User",
            policy,
            dontWantToSee
        });

        await newReport.save();
        // return success message and the report ID
        const reportId = newReport._id;
        return res.status(201).json({ message: "User reported successfully.", reportId });
    }
    catch (error) {
        console.error("Error reporting user:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

const reportPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const loggedInUserId = req.user.id;
        const { policy, dontWantToSee } = req.body;

        const allowedPolicies = [
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
        ]
        
        if (!allowedPolicies.includes(policy)) {
            return res.status(400).json({ message: "Invalid policy." });
        }

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: "Invalid post ID." });
        }

        const postToReport = await postModel.findById(postId);
        if (!postToReport) {
            return res.status(404).json({ message: "Post not found." });
        }

        const newReport = new reportModel({
            userId: loggedInUserId,
            reportedId: postId,
            reportedType: "Post",
            policy,
            dontWantToSee
        });

        await newReport.save();

        return res.status(201).json({ message: "Post reported successfully." });
    }
    catch (error) {
        console.error("Error reporting post:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

const getBlockedUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;

        const user = await userModel.findById(loggedInUserId).populate("blockedUsers", "name email profilePicture");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({ blockedUsers: user.blockedUsers });
    }
    catch (error) {
        console.error("Error fetching blocked users:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

const getReportById = async (req, res) => {
    try {
        const { reportId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return res.status(400).json({ message: "Invalid report ID." });
        }

        const report = await reportModel.findById(reportId);

        if (!report) {
            return res.status(404).json({ message: "Report not found." });
        }

        return res.status(200).json({ report });
    }
    catch (error) {
        console.error("Error fetching report:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

const getRepotedUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;

        const user = await userModel.findById(loggedInUserId).populate("reportedUsers", "name email profilePicture");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({ reportedUsers: user.reportedUsers });
    }
    catch (error) {
        console.error("Error fetching reported users:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

// Change connection request privacy setting
const controlConnectionRequest = async (req, res) => {
    try {
        const userId = req.user.id;
         const { connectionRequestPrivacySetting } = req.body;

         const allowedValues = ["everyone", "mutual"];

        if (!allowedValues.includes(connectionRequestPrivacySetting)) {
            return res.status(400).json({ message: "Invalid value for connection request privacy setting." });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        const user = await userModel.findByIdAndUpdate(userId, { connectionRequestPrivacySetting: connectionRequestPrivacySetting });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        return res.status(200).json({ message: "Connection request controlled successfully." });
    }
    catch (error) {
        console.error("Error controlling connection request:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

module.exports = {
    blockUser,
    unblockUser,
    reportUser,
    reportPost,
    getBlockedUsers,
    getReportById,
    getRepotedUsers,
    controlConnectionRequest,
}