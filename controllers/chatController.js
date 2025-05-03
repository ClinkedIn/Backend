const directChatModel = require('../models/directChatModel');
const groupChatModel = require('../models/chatGroupModel');
const userModel = require('../models/userModel');
const admin = require("firebase-admin");
const customError = require ('../utils/customError');
const mongoose = require('mongoose');

const {validateGroupChatData, calculateTotalUnreadCount, markMessageReadByUser} = require('../utils/chatUtils');

const createDirectChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.body;
        
        const user = await userModel.findById(userId);
        if (!user) {
            throw new customError('User not found', 404);
        }
        
        const otherUser = await userModel.findById(otherUserId);
        if (!otherUser) {
            throw new customError('Other user not found', 404);
        }
        
        // Check if chat already exists - corrected query to match schema design
        const existingChat = await directChatModel.findOne({
            $or: [
                { firstUser: userId, secondUser: otherUserId },
                { firstUser: otherUserId, secondUser: userId }
            ]
        });
        
        if (existingChat) {
            return res.status(200).json({
                message: 'Chat already exists',
                chatId: existingChat
            });
        }
        
        // Create new chat
        const newChat = await directChatModel.create({
            firstUser: userId,
            secondUser: otherUserId,
            messages: []
        });
        
        if (!newChat) {
            throw new customError('Failed to create chat', 500);
        }
        
        // Add chat to both users' chat lists
        user.chats.push({
            chatId: newChat._id,
            chatType: 'DirectChat',
            unreadCount: 0,
            lastReadAt: new Date()
        });
        await user.save();
        
        otherUser.chats.push({
            chatId: newChat._id,
            chatType: 'DirectChat',
            unreadCount: 0,
            lastReadAt: new Date()
        });
        await otherUser.save();
        
        // Respond with chat info
        res.status(201).json({
            message: 'Direct chat created successfully',
            chat: {
                _id: newChat._id,
                firstUser: userId,
                secondUser: otherUserId,
                createdAt: newChat.createdAt,
                updatedAt: newChat.updatedAt
            }
        });

        // update in firebase
        const chatFirebaseDoc = admin.firestore().collection('conversations').doc(newChat._id.toString());
        await chatFirebaseDoc.set({
            firstUser: userId,
            secondUser: otherUserId,
            messages: [],
            unreadCounts: {
                [userId]: 0,
                [otherUserId]: 0
            },
            forceUnread: {
                [userId]: false,
                [otherUserId]: false
            }
        });
    }
    catch (err) {
        if (err instanceof customError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error('Error creating direct chat:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

/*
@desc Create a group chat
@route POST /chats/group-chat
@access Private
*/

const createGroupChat = async (req, res) => {
    try {
        const { groupName, groupMembers } = req.body;
        const userId = req.user.id;

        const user = await userModel.findById(userId);
        if (!user) {
            throw new customError('User not found', 404);
        }

        await validateGroupChatData(userId, groupName, groupMembers);
        
        const groupChat = await groupChatModel.create({
            name: groupName,
            members: [userId, ...groupMembers],
            messages: [],
        });
        if (!groupChat) {
            throw new customError('Failed to create group chat', 500);
        }

        // Add chat to all members' chat lists
        const allMembers = [userId, ...groupMembers];
        for (const memberId of allMembers) {
            const member = await userModel.findById(memberId);
            if (member) {
                member.chats.push({
                    chatId: groupChat._id,
                    chatType: 'ChatGroup', 
                    unreadCount: 0,
                    lastReadAt: new Date()
                });
                await member.save();
            }
        }

        res.status(201).json({ 
            message: 'Group chat created successfully', 
            groupChat 
        });

    } catch (err) {
        if (err instanceof customError) {
            res.status(err.statusCode).json({ message: err.message });
        }
        else {
            console.error('Error creating group chat:', err);  // FIXED: Added error logging
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};


/*
@desc Get a direct chat by ID
@route GET /chats/direct-chat/:chatId
@access Private
*/
const getDirectChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const chatId = req.params.chatId;

        // Validate chatId
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            throw new customError('Invalid chat ID format', 400);
        }
        
        // Find user and validate existence
        const user = await userModel.findById(userId);
        if (!user) {
            throw new customError('User not found', 404);
        }
        
        // Find the direct chat with populated messages
        const chat = await directChatModel.findById(chatId)
            .populate({
                path: 'messages',
                options: { 
                    sort: { createdAt: -1 }  // Most recent messages first
                },
                // Populate message sender and attachments
                populate: [
                    {
                        path: 'sender',
                        select: 'firstName lastName profilePicture' 
                    },
                    {
                        path: 'replyTo',
                        select: 'messageText sender createdAt',
                        populate: {
                            path: 'sender',
                            select: 'firstName lastName'
                        }
                    }
                ]
            });
            
        if (!chat) {
            throw new customError('Chat not found', 404);
        }
        
        chatMembers = [chat.firstUser, chat.secondUser];
       
        // Check if user is a member
        if (!chatMembers.some(member => member && member.toString() === userId)) {
            throw new customError('Not authorized to access this chat', 403);
        }
        
        // Find the other user in this chat
        const otherUserId = chatMembers.find(member => 
            member && member.toString() !== userId
        );
        
        // Get other user's details
        const otherUser = otherUserId ? 
            await userModel.findById(otherUserId)
                .select('firstName lastName profilePicture headLine email') : null;
            
        // Reset unread count for this chat
        const userChat = user.chats.find(c => 
            c.chatId.toString() === chatId && c.chatType === 'DirectChat'
        );
        
        if (userChat) {
            userChat.unreadCount = 0;
            userChat.lastReadAt = new Date();
            await user.save();
        }
        
        if (chat.messages && chat.messages.length > 0) {
            // Find messages that aren't from the current user and haven't been read by them
            const messagesToMark = chat.messages.filter(message => 
                message.sender && 
                message.sender._id.toString() !== userId && 
                (!message.readBy || !message.readBy.includes(userId))
            );
            
            // Use markMessageReadByUser for each message that needs to be marked as read
            for (const message of messagesToMark) {
                try {
                    await markMessageReadByUser(message._id, userId);
                } catch (error) {
                    console.error(`Failed to mark message ${message._id} as read:`, error);
                }
            }
        }

        // Process messages to add isMine flag and format dates
        const processedMessages = chat.messages.map(message => {
            const messageObj = message.toObject ? message.toObject() : message;
            return {
                ...messageObj,
                isMine: message.sender?._id.toString() === userId,
                formattedTime: new Date(message.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                formattedDate: new Date(message.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
            };
        });
        
        // Group messages by date for better UI rendering
        const groupedMessages = {};
        processedMessages.forEach(message => {
            const date = new Date(message.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            if (!groupedMessages[date]) {
                groupedMessages[date] = [];
            }
            
            groupedMessages[date].push(message);
        });
        
        // Convert grouped messages to array format
        const conversationHistory = Object.keys(groupedMessages).map(date => ({
            date,
            messages: groupedMessages[date].sort((a, b) => 
                new Date(a.createdAt) - new Date(b.createdAt)) // Sort messages chronologically
        }));
        
        // Sort days chronologically (oldest first)
        conversationHistory.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });
        
        res.status(200).json({
            success: true,
            chat: {
                _id: chat._id,
                members: chat.members,
                conversationHistory,  // Organized by date
                rawMessages: processedMessages.sort((a, b) => 
                    new Date(a.createdAt) - new Date(b.createdAt)), // Alternative flat sorted list
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt
            },
            otherUser: otherUser || null,
            chatInfo: {
                chatType: 'direct',
                lastActive: chat.updatedAt,
                unreadCount: 0 // Reset to 0 since we just viewed it
            }
        });
        
    } catch (err) {
        if (err instanceof customError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error('Error fetching direct chat:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

/*
@desc Get all chats for a user
@route GET /chats/all-chats
@access Private
*/

const getAllDirectChats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);
        if (!user) {
            throw new customError('User not found', 404);
        }
        
        const userChats = user.chats || [];
        
        if (!userChats || userChats.length === 0) {
            return res.status(200).json({
                success: true,
                totalChats: 0,
                totalUnread: 0,
                chats: []
            });
        }
        
        const directChatIds = [];
        userChats.forEach(chat => {
            if (!chat.chatId || chat.chatType !== 'DirectChat') return;
            
            try {
                directChatIds.push(new mongoose.Types.ObjectId(chat.chatId));
            } catch (error) {
                console.error(`Invalid chat ID: ${chat.chatId}`, error);
                
            }
        });

        if (directChatIds.length === 0) {
            return res.status(200).json({
                success: true,
                totalChats: 0,
                totalUnread: 0,
                chats: []
            });
        }
        
        // Query for direct chats
        const directChats = await directChatModel.find({
            _id: { $in: directChatIds }
        }).populate({
            path: 'messages',
            options: { 
                sort: { createdAt: -1 },
                limit: 1 // Only get the latest message for preview
            },
            populate: {
                path: 'sender',
                select: 'firstName lastName profilePicture'
            }
        });
        
        // Get other users' info for direct chats
        let otherUserIds = [];
        directChats.forEach(chat => {
            let otherUserId = null;
            otherUserId = chat.firstUser.toString() === userId ? 
                chat.secondUser : chat.firstUser;
            
            if (otherUserId) {
                otherUserIds.push(otherUserId);
            }
        });
        
        const otherUsers = otherUserIds.length > 0 ? 
            await userModel.find({ _id: { $in: otherUserIds } })
                .select('_id firstName lastName profilePicture headLine') : [];
        
        // Process direct chats for response
        const processedDirectChats = directChats.map(chat => {
            // Find the chat reference in user's chats array
            const userChatRef = userChats.find(uc => 
                uc.chatId && chat._id && uc.chatId.toString() === chat._id.toString()
            );
            
            let otherUser = null;
            let otherUserId = null;
            
            otherUserId = chat.firstUser.toString() === userId ? 
                chat.secondUser : chat.firstUser;
            
            if (otherUserId) {
                otherUser = otherUsers.find(user => 
                    user && user._id && otherUserId && 
                    user._id.toString() === otherUserId.toString()
                );
            }
            
            const latestMessage = chat.messages && chat.messages.length > 0 ? chat.messages[0] : null;
            
            return {
                _id: chat._id,
                chatType: 'direct',
                name: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User',
                participants: {
                    count: 2,
                    otherUser: otherUser ? {
                        _id: otherUser._id,
                        firstName: otherUser.firstName,
                        lastName: otherUser.lastName,
                        profilePicture: otherUser.profilePicture,
                        headLine: otherUser.headLine
                    } : null
                },
                unreadCount: userChatRef ? userChatRef.unreadCount || 0 : 0,
                lastMessage: latestMessage ? {
                    _id: latestMessage._id,
                    sender: latestMessage.sender,
                    messageText: latestMessage.messageText,
                    createdAt: latestMessage.createdAt,
                    formattedTime: latestMessage.createdAt ? new Date(latestMessage.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : '',
                    isMine: latestMessage.sender && latestMessage.sender._id && 
                        latestMessage.sender._id.toString() === userId
                } : null,
                lastActive: chat.updatedAt || chat.createdAt || new Date(),
                createdAt: chat.createdAt || new Date()
            };
        });
        
        // Sort by most recent activity
        const sortedChats = processedDirectChats
            .filter(chat => chat.lastActive)
            .sort((a, b) => {
                const dateA = new Date(a.lastActive || 0);
                const dateB = new Date(b.lastActive || 0);
                return dateB - dateA;
            });
        
        // Calculate unread count for direct chats only
        const directUnreadCount = userChats
            .filter(chat => chat.chatType === 'DirectChat')
            .reduce((total, chat) => total + (chat.unreadCount || 0), 0);
        
        // Return the direct chats only
        res.status(200).json({
            success: true,
            totalChats: sortedChats.length,
            totalUnread: directUnreadCount,
            chats: sortedChats
        });
        
    } catch (err) {
        if (err instanceof customError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error('Error fetching direct chats:', err);
            res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }
};

const getGroupChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const groupId = req.params.groupId;
        
        // Validate groupId format
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            throw new customError('Invalid group ID format', 400);
        }
        
        // Find user
        const user = await userModel.findById(userId);
        if (!user) {
            throw new customError('User not found', 404);
        }
        
        // Find group chat with populated messages
        const chat = await groupChatModel.findById(groupId)
            .populate({
                path: 'messages',
                options: { sort: { createdAt: -1 }, limit: 50 },
                populate: [
                    { path: 'sender', select: 'firstName lastName profilePicture' },
                    {
                        path: 'replyTo',
                        select: 'messageText sender createdAt',
                        populate: { path: 'sender', select: 'firstName lastName' }
                    }
                ]
            })
            .populate('members', 'firstName lastName profilePicture headLine');
            
        if (!chat) {
            throw new customError('Group chat not found', 404);
        }
        
        // Check if user is member of the group
        if (!chat.members.some(m => m._id.toString() === userId)) {
            throw new customError('Not authorized to access this group', 403);
        }
        
        // Update unread count in user's chat list
        const userChat = user.chats.find(c => 
            c.chatId.toString() === groupId && c.chatType === 'ChatGroup'
        );
        
        if (userChat) {
            userChat.unreadCount = 0;
            userChat.lastReadAt = new Date();
            await user.save();
        }
        
        // Process messages similar to direct chat
        const processedMessages = chat.messages.map(message => {
            const messageObj = message.toObject ? message.toObject() : message;
            return {
                ...messageObj,
                isMine: message.sender?._id.toString() === userId,
                formattedTime: new Date(message.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit', minute: '2-digit'
                }),
                formattedDate: new Date(message.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                })
            };
        });
        
        // Group messages by date
        const groupedMessages = {};
        processedMessages.forEach(message => {
            const date = new Date(message.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
            
            if (!groupedMessages[date]) {
                groupedMessages[date] = [];
            }
            
            groupedMessages[date].push(message);
        });
        
        // Convert to array and sort
        const conversationHistory = Object.keys(groupedMessages).map(date => ({
            date,
            messages: groupedMessages[date].sort((a, b) => 
                new Date(a.createdAt) - new Date(b.createdAt))
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        res.status(200).json({
            success: true,
            chat: {
                _id: chat._id,
                name: chat.name,
                members: chat.members.map(member => ({
                    _id: member._id,
                    firstName: member.firstName,
                    lastName: member.lastName,
                    profilePicture: member.profilePicture,
                    headLine: member.headLine
                })),
                conversationHistory,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt
            },
            chatInfo: {
                chatType: 'group',
                lastActive: chat.updatedAt,
                unreadCount: 0,
                memberCount: chat.members.length
            }
        });
        
    } catch (err) {
        if (err instanceof customError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error('Error fetching group chat:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};


const updateDirectChat = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};


const updateGroupChat = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};


/*
@desc Mark a chat as read
@route PATCH /chats/mark-as-read/:chatId
@access Private
*/

const markChatAsRead = async (req, res) => {
    try {
      const userId = req.user.id;
      const chatId = req.params.chatId;
  
      // Find the user in MongoDB
      const user = await userModel.findById(userId);
      if (!user) {
        throw new customError('User not found', 404);
      }
  
      // Find the chat in the user's chats
      const userChat = user.chats.find((c) => c.chatId.toString() === chatId);
      if (!userChat) {
        throw new customError("Chat not found in user's chats", 404);
      }
  
      // Update unread count and last read time in MongoDB
      userChat.unreadCount = 0; // Set unread count to 0
      userChat.lastReadAt = new Date();
      await user.save();
  
      // Update Firebase
      try {
        const chatFirebaseDoc = admin.firestore().collection('conversations').doc(chatId);
  
        // Check if the chat document exists in Firebase
        const chatDoc = await chatFirebaseDoc.get();
        if (chatDoc.exists) {
          // Update forceUnread to false and unread count to 0 for the logged-in user
          await chatFirebaseDoc.update({
            [`forceUnread.${userId}`]: false, // Set forceUnread to false
            [`unreadCounts.${userId}`]: 0, // Set unread count to 0 for the logged-in user
          });
          console.log(`Updated forceUnread and unread count for user ${userId} in chat ${chatId}`);
        } else {
          console.warn(`Chat document not found in Firebase for chat ID: ${chatId}`);
        }
      } catch (firebaseErr) {
        console.error('Error updating Firebase:', firebaseErr);
        // Continue with the response as MongoDB update was successful
      }
  
      res.status(200).json({ message: 'Chat marked as read successfully' });
    } catch (err) {
      if (err instanceof customError) {
        res.status(err.statusCode).json({ message: err.message });
      } else {
        console.error('Error marking chat as read:', err);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
};


/*
@desc Mark a chat as unread
@route PATCH /chats/mark-as-unread/:chatId
@access Private
*/

const markChatAsUnread = async (req, res) => {
    try {
        const userId = req.user.id;
        const chatId = req.params.chatId;
    
        // Find the user in MongoDB
        const user = await userModel.findById(userId);
        if (!user) {
          throw new customError('User not found', 404);
        }
    
        // Find the chat in the user's chats
        const userChat = user.chats.find((c) => c.chatId.toString() === chatId);
        if (!userChat) {
          throw new customError("Chat not found in user's chats", 404);
        }
    
        // Update unread count and last read time in MongoDB
        userChat.unreadCount = 1; // Set unread count to 1
        userChat.lastReadAt = new Date();
        await user.save();
        console.log(`Updated unread count for user ${userId} in chat ${chatId}`);
    
        // Update Firebase
        try {
          const chatFirebaseDoc = admin.firestore().collection('conversations').doc(chatId);
    
          // Check if the chat document exists in Firebase
          const chatDoc = await chatFirebaseDoc.get();
          if (chatDoc.exists) {
            // Update forceUnread array and unread count for the logged-in user
            await chatFirebaseDoc.update({
              [`forceUnread.${userId}`]: true, // Add the user to the forceUnread array
              [`unreadCounts.${userId}`]: 1, // Set unread count to 1 for the logged-in user
            });
            console.log(`Updated forceUnread and unread count for user ${userId} in chat ${chatId}`);
          } else {
            console.warn(`Chat document not found in Firebase for chat ID: ${chatId}`);
          }
        } catch (firebaseErr) {
          console.error('Error updating Firebase:', firebaseErr);
          // Continue with the response as MongoDB update was successful
        }
    
        res.status(200).json({ message: 'Chat marked as unrearead successfully' });
      } catch (err) {
        if (err instanceof customError) {
          res.status(err.statusCode).json({ message: err.message });
        } else {
          console.error('Error marking chat as read:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
}


module.exports = {
    createDirectChat,
    createGroupChat,
    getDirectChat,
    getGroupChat,
    getAllDirectChats,
    updateDirectChat,
    updateGroupChat,
    markChatAsRead,
    markChatAsUnread
};