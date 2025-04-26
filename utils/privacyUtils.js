const userModel = require("../models/userModel");
const reportModel = require("../models/reportModel");
const postModel = require("../models/postModel");
const mongoose = require("mongoose");
const customError = require("../utils/customError");


const isConnection = async (userId, loggedInUserId) => {
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new customError("User not found", 404);
        }
        const connections = user.connectionList || [];
        
        return connections.some(connectionId => 
            connectionId.toString() === loggedInUserId.toString()
        );
    } catch (error) {
        throw new customError("Error checking connection", 500);
    }
};

const isBlocked = async (userId, loggedInUserId) => {
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new customError("User not found", 404);
        }
        const blockedUsers = user.blockedUsers || [];
        
        return blockedUsers.some(blockedId => 
            blockedId.toString() === loggedInUserId.toString()
        );
    } catch (error) {
        throw new customError("Error checking block status", 500);
    }
};

const canSendConnectionRequest = async (userId, loggedInUserId) => {
    try {
        console.log("Checking if user can send connection request...");
        const user = await userModel.findById(userId);
        if (!user) {
            console.log("User not found");
            throw new customError("User not found", 404);
        }
        const userConnectionPrivacy = user.connectionRequestPrivacySetting|| 'everyone';
        console.log("User connection privacy settings:", userConnectionPrivacy);
        if (userConnectionPrivacy === 'everyone') {
            console.log("User connection privacy is 'everyone'");
            return true;
        }
        console.log("User connection privacy is 'mutual' or other settings");
        if (userConnectionPrivacy  === "mutual") {
            console.log("User connection privacy 'mutual'");
            const loggedInUser = await userModel.findById(loggedInUserId);
            if (!loggedInUser) {
                throw new customError("Logged in user not found", 404);
            }
            const loggedInUserConnections = loggedInUser.connectionList || [];
            // check for every connection in the loggedInUser's connection list if they are also in the user connection list
            const userConnections = user.connectionList || [];
            const mutualConnections = loggedInUserConnections.filter(connectionId => 
                userConnections.some(userConnectionId => 
                    userConnectionId.toString() === connectionId.toString()
                )
            );
            return mutualConnections.length > 0;
        }

    } catch (error) {
        throw new customError("Error checking connection request status", 500);
    }
};


module.exports = {
    isConnection,
    isBlocked,
    canSendConnectionRequest,
}