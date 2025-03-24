// Description: Utility functions for chat related operations.
const userModel = require('../models/userModel');
const MessageModel = require('../models/chatMessageModel');
const directChatModel = require('../models/directChatModel');
const chatGroupModel = require('../models/chatGroupModel');
const customError = require('./customError');

const { uploadPicture, uploadVideo, uploadDocument } = require('./filesHandler');

const validateUser = async (userId) => {
    const user = await userModel.findById(userId);
    if (!user) {
        throw new customError('User not found', 404);
    }
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

const validateChatMembership = async (chatModel, chatId, sender, type) => {
    const chat = await chatModel.findById(chatId, 'firstUser secondUser members');
    if (!chat) {
        throw new customError('Chat not found', 404);
    }

    const isMember = type === 'direct'
        ? chat.firstUser.toString() === sender || chat.secondUser.toString() === sender
        : chat.members.map(member => member.toString()).includes(sender);
        
    if (!isMember) {
        throw new customError('You are not a member of this chat', 403);
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

const findOrCreateDirectChat = async (sender, receiverId) => {
    let chat = await directChatModel.findOne({
        $or: [
            { firstUser: sender, secondUser: receiverId },
            { firstUser: receiverId, secondUser: sender }
        ]
    });

    if (!chat) {
        // Create a new direct chat
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

const updateUnreadCount = async (receiverId, chatId) => {
    await userModel.findOneAndUpdate(
        { _id: receiverId, "chats.chatId": chatId },
        { $inc: { "chats.$.unreadCount": 1 } } // Increment unread count
    );
};

const updateGroupUnreadCounts = async (chatId, sender) => {
    const chat = await chatGroupModel.findById(chatId, 'members');
    if (!chat) {
        throw new customError('Chat not found', 404);
    }

    const members = chat.members.filter(member => member.toString() !== sender);
    for (const member of members) {
        await updateUnreadCount(member, chatId);
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
    validateMessageOwner
};