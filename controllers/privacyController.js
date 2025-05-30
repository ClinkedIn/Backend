const userModel = require("../models/userModel");
const reportModel = require("../models/reportModel");
const postModel = require("../models/postModel");
const mongoose = require("mongoose");


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

        const loggedInUser = await userModel.findById(loggedInUserId);
        
        if (!loggedInUser.blockedUsers.includes(userId)) {
            loggedInUser.blockedUsers.push(userId);
        }
        
        if (loggedInUser.connectionList && Array.isArray(loggedInUser.connectionList)) {
            loggedInUser.connectionList = loggedInUser.connectionList.filter(
                id => id && id.toString() !== userId
            );
        }
        
        if (loggedInUser.sentConnectionRequests && Array.isArray(loggedInUser.sentConnectionRequests)) {
            loggedInUser.sentConnectionRequests = loggedInUser.sentConnectionRequests.filter(
                id => id && id.toString() !== userId
            );
        }
        
        if (loggedInUser.receivedConnectionRequests && Array.isArray(loggedInUser.receivedConnectionRequests)) {
            loggedInUser.receivedConnectionRequests = loggedInUser.receivedConnectionRequests.filter(
                id => id && id.toString() !== userId
            );
        }
        
        if (loggedInUser.following && Array.isArray(loggedInUser.following)) {
            loggedInUser.following = loggedInUser.following.filter(
                item => item && item.entity && !(item.entity.toString() === userId && item.entityType === "User")
            );
        }
        
        if (loggedInUser.followers && Array.isArray(loggedInUser.followers)) {
            loggedInUser.followers = loggedInUser.followers.filter(
                item => item && item.entity && !(item.entity.toString() === userId && item.entityType === "User")
            );
        }
        
        await loggedInUser.save();
        
        const blockedUser = await userModel.findById(userId);
        
        if (blockedUser.connectionList && Array.isArray(blockedUser.connectionList)) {
            blockedUser.connectionList = blockedUser.connectionList.filter(
                id => id && id.toString() !== loggedInUserId
            );
        }
        
        if (blockedUser.sentConnectionRequests && Array.isArray(blockedUser.sentConnectionRequests)) {
            blockedUser.sentConnectionRequests = blockedUser.sentConnectionRequests.filter(
                id => id && id.toString() !== loggedInUserId
            );
        }
        
        if (blockedUser.receivedConnectionRequests && Array.isArray(blockedUser.receivedConnectionRequests)) {
            blockedUser.receivedConnectionRequests = blockedUser.receivedConnectionRequests.filter(
                id => id && id.toString() !== loggedInUserId
            );
        }
        
        if (blockedUser.following && Array.isArray(blockedUser.following)) {
            blockedUser.following = blockedUser.following.filter(
                item => item && item.entity && !(item.entity.toString() === loggedInUserId && item.entityType === "User")
            );
        }
        
        if (blockedUser.followers && Array.isArray(blockedUser.followers)) {
            blockedUser.followers = blockedUser.followers.filter(
                item => item && item.entity && !(item.entity.toString() === loggedInUserId && item.entityType === "User")
            );
        }
        
        await blockedUser.save();

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
        const { policy } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        if (!policy) {
            return res.status(400).json({ message: "Policy is required." });
        }

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
            // User-specific violations
            "This person is impersonating someone", 
            "This account has been hacked", 
            "This account is not a real person"
        ];

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

        await userModel.findByIdAndUpdate(
            loggedInUserId, 
            { $addToSet: { reportedUsers: userId } }
        );

        const newReport = new reportModel({
            userId: loggedInUserId,
            reportedId: userId,
            reportedType: "User",
            policy
        });

        await newReport.save();

        const reportId = newReport._id;
        return res.status(201).json({ message: "User reported successfully.", reportId });
    }
    catch (error) {
        console.error("Error reporting user:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

const reportPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const loggedInUserId = req.user.id;
        const { policy, dontWantToSee } = req.body;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: "Invalid post ID." });
        }

        if (!policy) {
            return res.status(400).json({ message: "Policy is required." });
        }

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
        ];

        const allowedDontWantToSee = [
              "I'm not interested in the author",
              "I'm not interested in this topic",
              "I've seen too many posts on this topic",
              "I've seen this post before",
              "This post is old",
              "It's something else",
        ];
        
        if (dontWantToSee && !allowedDontWantToSee.includes(dontWantToSee)) {
            return res.status(400).json({ message: "Invalid dontWantToSee value." });
        }

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
        return res.status(200).json({ message: "Connection request updated successfully." });
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