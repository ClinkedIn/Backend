const directChatModel = require('../models/directChatModel');
const groupChatModel = require('../models/chatGroupModel');
const userModel = require('../models/userModel');

const customError = require ('../utils/customError');
const mongoose = require('mongoose');

const {validateGroupChatData, calculateTotalUnreadCount} = require('../utils/chat');

const createDirectChat = async (req, res) => {
    try {
        const userId = req.user.id
        const { otherUserId } = req.body;
        // Validate user existence
        const user = await userModel.findById(userId);
        if (!user) {
            throw new customError('User not found', 404);
        }
        // Validate other user existence
        const otherUser = await userModel.findById(otherUserId);
        if (!otherUser) {
            throw new customError('Other user not found', 404);
        }
        // Check if chat already exists
        const existingChat = await directChatModel.findOne({
            members: { $all: [userId, otherUserId] }
        });
        if (existingChat) {
            return res.status(200).json({
                message: 'Chat already exists',
                chatId: existingChat._id
            });
        }
        // Create new chat
        const newChat = await directChatModel.create({
            members: [userId, otherUserId],
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
        // Populate chat members
        res.status(201).json({
            message: 'Direct chat created successfully',
            chat: {
                _id: newChat._id,
                members: [userId, otherUserId],
                createdAt: newChat.createdAt,
                updatedAt: newChat.updatedAt
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
        console.log("User ID:", userId); // Debug log
        console.log("Chat ID:", chatId); // Debug log
        // Find user and validate existence
        const user = await userModel.findById(userId);
        if (!user) {
            throw new customError('User not found', 404);
        }
        console.log("User found:", user); // Debug log
        // Find the direct chat with populated messages
        const chat = await directChatModel.findById(chatId)
            .populate({
                path: 'messages',
                options: { 
                    sort: { createdAt: -1 },  // Most recent messages first
                    limit: 50                  // Limit to latest 50 messages
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
        
        // Handle different chat structures
        let chatMembers = [];
        if (Array.isArray(chat.members)) {
            chatMembers = chat.members;
        } else if (chat.firstUser && chat.secondUser) {
            // Old structure with firstUser and secondUser
            chatMembers = [chat.firstUser, chat.secondUser];
        } else {
            throw new customError('Invalid chat structure', 500);
        }
        
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
                .select('firstName lastName profilePicture headLine') : null;
            
        // Reset unread count for this chat
        const userChat = user.chats.find(c => 
            c.chatId.toString() === chatId && c.chatType === 'DirectChat'
        );
        
        if (userChat) {
            userChat.unreadCount = 0;
            userChat.lastReadAt = new Date();
            await user.save();
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

const getAllChats = async (req, res) => {
    try {
        const userId = req.user.id;
        // Find user and validate existence
        const user = await userModel.findById(userId);
        if (!user) {
            throw new customError('User not found', 404);
        }
        
        // Get chat references from user model
        const userChats = user.chats || [];
        
        // If user has no chats, return empty array
        if (!userChats || userChats.length === 0) {
            return res.status(200).json({
                success: true,
                totalChats: 0,
                totalUnread: 0,
                chats: []
            });
        }
        
        // Split chat IDs by type
        const directChatIds = [];
        const groupChatIds = [];
        userChats.forEach(chat => {
            // Make sure chatId is valid before adding to arrays
            if (!chat.chatId) return;
            
            try {
                if (chat.chatType === 'DirectChat') {
                    directChatIds.push(new mongoose.Types.ObjectId(chat.chatId));
                } else if (chat.chatType === 'ChatGroup') {
                    groupChatIds.push(new mongoose.Types.ObjectId(chat.chatId));
                }
            } catch (error) {
                console.error(`Invalid chat ID: ${chat.chatId}`, error);
                // Skip this chat but continue processing others
            }
        });
        
        // Query for direct chats
        const directChats = directChatIds.length > 0 ? await directChatModel.find({
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
        }) : [];
        
        // Query for group chats
        const groupChats = groupChatIds.length > 0 ? await groupChatModel.find({
            _id: { $in: groupChatIds }
        }).populate({
            path: 'messages',
            options: { 
                sort: { createdAt: -1 },
                limit: 1 
            },
            populate: {
                path: 'sender',
                select: 'firstName lastName profilePicture'
            }
        }) : [];
        
        // Get other users' info for direct chats
        let otherUserIds = [];
        directChats.forEach(chat => {
            // Check both member structures (new and old)
            let otherUserId = null;
            
            // Handle newer schema with members array
            if (chat.members && Array.isArray(chat.members)) {
                otherUserId = chat.members.find(memberId => 
                    memberId && memberId.toString() !== userId
                );
            }
            // Handle older schema with firstUser and secondUser
            else if (chat.firstUser && chat.secondUser) {
                otherUserId = chat.firstUser.toString() === userId ? 
                    chat.secondUser : chat.firstUser;
            }
            
            if (otherUserId) {
                otherUserIds.push(otherUserId);
            }
        });
        
        // Get other users' details
        const otherUsers = otherUserIds.length > 0 ? 
            await userModel.find({ _id: { $in: otherUserIds } })
                .select('_id firstName lastName profilePicture headLine') : [];
        
        // Process direct chats for response
        const processedDirectChats = directChats.map(chat => {
            // Find the chat reference in user's chats array
            const userChatRef = userChats.find(uc => 
                uc.chatId && chat._id && uc.chatId.toString() === chat._id.toString()
            );
            
            // Find the other user in the chat
            let otherUser = null;
            let otherUserId = null;
            
            // Check both schemas
            if (chat.members && Array.isArray(chat.members)) {
                otherUserId = chat.members.find(memberId => 
                    memberId && memberId.toString() !== userId
                );
            } else if (chat.firstUser && chat.secondUser) {
                otherUserId = chat.firstUser.toString() === userId ? 
                    chat.secondUser : chat.firstUser;
            }
            
            if (otherUserId) {
                otherUser = otherUsers.find(user => 
                    user && user._id && otherUserId && 
                    user._id.toString() === otherUserId.toString()
                );
            }
            
            // Get the latest message (safely)
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
        
        // Process group chats - unchanged
        const processedGroupChats = groupChats.map(chat => {
            const userChatRef = userChats.find(uc => 
                uc.chatId && chat._id && uc.chatId.toString() === chat._id.toString()
            );
            
            const latestMessage = chat.messages && chat.messages.length > 0 ? chat.messages[0] : null;
            
            return {
                _id: chat._id,
                chatType: 'group',
                name: chat.name || 'Group Chat',
                participants: {
                    count: chat.members ? chat.members.length : 0,
                    list: chat.members || [] 
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
        
        const allChats = [...processedDirectChats, ...processedGroupChats]
            .filter(chat => chat.lastActive)
            .sort((a, b) => {
                const dateA = new Date(a.lastActive || 0);
                const dateB = new Date(b.lastActive || 0);
                return dateB - dateA;
            });
        
        // Use the shared utility function instead of client-side calculation
        const totalUnread = await calculateTotalUnreadCount(userId);
        
        // Return the chats
        res.status(200).json({
            success: true,
            totalChats: allChats.length,
            totalUnread: totalUnread,
            chats: allChats
        });
        
    } catch (err) {
        if (err instanceof customError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error('Error fetching all chats:', err);
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
        // decrement unread count for the chat
        const user = await userModel.findById(userId);
        if (!user) {
            throw new customError('User not found', 404);
        }
        // Find the chat in user's chats
        const userChat = user.chats.find(c => c.chatId.toString() === chatId);
        if (!userChat) {
            throw new customError('Chat not found in user\'s chats', 404);
        }
        // Update unread count and last read time
        userChat.unreadCount = 0;
        userChat.lastReadAt = new Date();
        await user.save();
        res.status(200).json({ message: 'Chat marked as read successfully' });

    } catch (err) {
        if (err instanceof customError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error('Error marking chat as read:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

/*
@desc Mark a chat as unread
@route PATCH /chats/mark-as-unread/:chatId
@access Private
*/

const markChatAsUnread = async (req, res) => {
    try {
        const userId = req.user.id;
        const chatId = req.params.chatId;
        // decrement unread count for the chat
        const user = await userModel.findById(userId);
        if (!user) {
            throw new customError('User not found', 404);
        }
        // Find the chat in user's chats
        const userChat = user.chats.find(c => c.chatId.toString() === chatId);
        if (!userChat) {
            throw new customError('Chat not found in user\'s chats', 404);
        }
        // Update unread count
        userChat.unreadCount += 1;
        await user.save();
        res.status(200).json({ message: 'Chat marked as unread successfully' });

    } catch (err) {
        if (err instanceof customError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error('Error marking chat as unread:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}





module.exports = {
    createDirectChat,
    createGroupChat,
    getDirectChat,
    getGroupChat,
    getAllChats,
    updateDirectChat,
    updateGroupChat,
    markChatAsRead,
    markChatAsUnread
};