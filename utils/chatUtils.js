// Description: Utility functions for chat related operations.
const userModel = require('../models/userModel');
const MessageModel = require('../models/chatMessageModel');
const directChatModel = require('../models/directChatModel');
const groupChatModel = require('../models/chatGroupModel');
const chatGroupModel = require('../models/chatGroupModel');
const customError = require('./customError');
const mongoose = require('mongoose');


const { uploadPicture, uploadVideo, uploadDocument } = require('./filesHandler');

const validateUser = async (userId) => {
    const user = await userModel.findById(userId);
    if (!user) {
        console.error(`User ${userId} not found`);
        throw new customError('User not found', 404);
    }
    return user
};

const validateChatType = (type) => {
    if (type !== 'direct' && type !== 'group') {
        throw new customError('Invalid chat type', 400);
    }
};

const validateChatId = (chatId) => {
    if (!chatId) {
        throw new customError('Chat ID is required', 400);
    }
};

const validateMessageContent = (messageText, messageAttachment) => {
    if (!messageText && (!messageAttachment || messageAttachment.length === 0)) {
        throw new customError('Message content is required', 400);
    }
};

const validateReplyMessage = async (replyTo) => {
    const replyMessage = await MessageModel.findById(replyTo);
    if (!replyMessage) {
        throw new customError('Reply message not found', 404);
    }
};

const getChatMembers = async (chatModel, chatId) => {
    const chat = await chatModel.findById(chatId, 'firstUser secondUser members');
    if (!chat) {
        throw new customError('Chat not found', 404);
    }
    return chat.members || [chat.firstUser, chat.secondUser];
};

const validateChatMembership = async (chatModel, chatId, sender, type) => {
    const chatMembers = await getChatMembers(chatModel, chatId);

    const isMember = chatMembers.map(member => member.toString()).includes(sender);
        
    if (!isMember) {
        throw new customError('Sender is not a member of this chat', 403);
    }
};


const handleFileUploads = async (messageAttachment) => {
    const attachmentsArray = [];

    if (messageAttachment && messageAttachment.length > 0) {
        for (const file of messageAttachment) {
            const { buffer, mimetype, size } = file;

            let uploadedFile;
            if (mimetype.startsWith('image/')) {
                uploadedFile = await uploadPicture(buffer, mimetype, size);
            } else if (mimetype.startsWith('video/')) {
                uploadedFile = await uploadVideo(buffer, mimetype, size);
            } else if (mimetype.startsWith('application/') || mimetype.startsWith('text/')) {
                uploadedFile = await uploadDocument(buffer, mimetype, size);
            } else {
                throw new customError("Invalid file type", 400);
            }

            attachmentsArray.push(uploadedFile.url);
        }
    }

    return attachmentsArray;
};

const checkConnectionStatus = async (firstUserId, secondUserId) => {
    const receiver = await userModel.findById(secondUserId).select('connectionList');
    if (!receiver) {
        throw new customError('Receiver not found', 404);
    }
    const isSenderInReceiverConnectionList = receiver.connectionList.some(connection => connection.toString() === firstUserId);
    if (!isSenderInReceiverConnectionList) {
        throw new customError('Sender is not in receiver connection list', 403);
    }
    return true;
}

const findOrCreateDirectChat = async (sender, receiverId) => {
    let chat = await directChatModel.findOne({
        $or: [
            { firstUser: sender, secondUser: receiverId },
            { firstUser: receiverId, secondUser: sender }
        ]
    });

    if (!chat) {
        // Create a new direct chat
        // check if sender is in receiver connection list
       // checkConnectionStatus(sender, receiverId);

        // Create a new chat
        chat = new directChatModel({
            firstUser: sender,
            secondUser: receiverId,
            messages: []
        });
        await chat.save();

        // Add the chat to the sender's and receiver's `chats` array
        const updatedSender = await userModel.findByIdAndUpdate(
            sender,
            { $push: { chats: { chatId: chat._id, chatType: 'DirectChat' } } }
        );
        const updatedReciever = await userModel.findByIdAndUpdate(
            receiverId,
            { $push: { chats: { chatId: chat._id, chatType: 'DirectChat' } } }
        );
        console.log("users updated successfully")
        if (!updatedSender || !updatedReciever) {
            throw new Error('Failed to update user chats');
        }
    }

    return chat;
};


const updateUnreadCount = async (userId, chatId, chatType = 'DirectChat') => {
    try {
      // First check if the user exists
      const user = await userModel.findById(userId);
      
      if (!user) {
        console.error(`User ${userId} not found when updating unread count`);
        return false;
      }
      
      // Find the chat in the user's chats array
      const chatIndex = user.chats.findIndex(
        chat => chat.chatId.toString() === chatId.toString() && chat.chatType === chatType
      );
      
      if (chatIndex !== -1) {
        // Chat exists, increment unread count
        user.chats[chatIndex].unreadCount += 1;
      } else {
        // Chat doesn't exist in user's list, add it
        user.chats.push({
          chatId: chatId,
          chatType: chatType,
          unreadCount: 1,
          lastReadAt: new Date()
        });
      }
      
      // Save the updated user document
      await user.save();
      return true;
    } catch (error) {
      console.error('Error updating unread count:', error);
      return false;
    }
  }

const updateGroupUnreadCounts = async (chatId, sender) => {
    const chat = await chatGroupModel.findById(chatId, 'members');
    if (!chat) {
        throw new customError('Chat not found', 404);
    }

    const members = chat.members.filter(member => member.toString() !== sender);
    for (const member of members) {
        await updateUnreadCount(member, chatId, "ChatGroup");

    }
};

const validateMessageOwner = async (messageId, userId) => {
    const message = await MessageModel.findById(messageId);
    if (!message) {
        throw new customError('Message not found', 404);
    }
    if (message.sender.toString() !== userId) {
        throw new customError('You are not the owner of this message', 403);
    }
};


const validateGroupChatData = async (userId, groupName, groupMembers) => {
    if (!groupName || !groupMembers) {
        throw new customError('Please provide all values', 400);
    }
    if (groupMembers.length < 2) {
        throw new customError('Please provide at least 2 members', 400);
    }
    if (groupMembers.includes(userId)) {
        throw new customError('You cannot add yourself to the group', 400);
    }
    const members = await userModel.find({ _id: { $in: groupMembers } });
    if (members.length !== groupMembers.length) {
        throw new customError('Some members not found', 404);
    }
    const groupExists = await groupChatModel.findOne({ name: groupName });
    if (groupExists) {
        throw new customError('Group already exists', 400);
    }
}

const isSenderBlocked = async (senderId, receiverId) => {
    console.log("Receiver ID:", receiverId);
    const receiver = await userModel.findById(receiverId);
    if (!receiver) {
        console.error(`Receiver ${receiverId} not found`);
        throw new customError('Receiver not found', 404);
    }

    // Check if the sender is in the receiver's blocked list
    return receiver.blockedUsers.includes(senderId);
};


/**
 * Calculate total unread messages for a user
 * @param {string} userId - The user ID
 * @returns {Promise<number>} - Total unread count
 */
const calculateTotalUnreadCount = async (userId) => {
    try {
      console.log(`Calculating unread count for user: ${userId}`);
      
      // First get user document to debug
      const user = await userModel.findById(userId);
      if (!user) {
        console.error(`User ${userId} not found in calculateTotalUnreadCount`);
        return 0;
      }

      // Ensure userId is valid
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }
  
      const result = await userModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        {
          $project: {
            chatsForUnwind: { $ifNull: ["$chats", []] }
          }
        },
        { $unwind: { path: "$chatsForUnwind", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$_id",
            totalUnread: { $sum: { $ifNull: ["$chatsForUnwind.unreadCount", 0] } }
          }
        }
      ]);
      
      console.log(`Aggregation result:`, result);
      
      return result.length > 0 ? result[0].totalUnread : 0;
    } catch (error) {
      console.error('Error calculating unread count:', error);
      return 0; // Return 0 on error as a fallback
    }
};


/**
 * Mark a message as read by a specific user and update related unread counts
 * @param {string} messageId - ID of the message to mark as read
 * @param {string} userId - ID of the user who read the message
 * @returns {Object} Object containing the updated message and whether it was newly marked as read
 */
const markMessageReadByUser = async (messageId, userId) => {
    // Find the message first to check if it's already read by this user
    const message = await MessageModel.findById(messageId);
    
    if (!message) {
        throw new customError('Message not found', 404);
    }

    // Check if message is already read by this user
    const alreadyRead = message.readBy.includes(userId);
    
    // Update the message to mark it as read
    const updatedMessage = await MessageModel.findByIdAndUpdate(
        messageId,
        { $addToSet: { readBy: userId } },
        { new: true }
    ).populate('sender', '_id firstName lastName');
    
    // If the message wasn't already read by this user, update the unread count
    if (!alreadyRead && updatedMessage.chatId) {
        const chatType = updatedMessage.type === 'direct' ? 'DirectChat' : 'ChatGroup';
        
        // Find user's chat references
        const user = await userModel.findById(userId);
        if (user && user.chats) {
            const chatRef = user.chats.find(
                c => c.chatId.toString() === updatedMessage.chatId.toString() && 
                    c.chatType === chatType
            );
            
            if (chatRef && chatRef.unreadCount > 0) {
                chatRef.unreadCount -= 1;
                await user.save();
            }
        }
    }

    return { 
        updatedMessage,
        isNewReadReceipt: !alreadyRead
    };
};


module.exports = {
    validateUser,
    validateChatType,
    validateChatId,
    validateMessageContent,
    validateReplyMessage,
    validateChatMembership,
    handleFileUploads,
    findOrCreateDirectChat,
    updateUnreadCount,
    updateGroupUnreadCounts,
    validateMessageOwner,
    validateGroupChatData,
    isSenderBlocked,
    calculateTotalUnreadCount,
    getChatMembers,
    markMessageReadByUser
};