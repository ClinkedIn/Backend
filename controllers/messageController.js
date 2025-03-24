const MessageModel = require('../models/chatMessageModel');
const userModel = require('../models/userModel');
const directChatModel = require('../models/directChatModel');
const chatGroupModel = require('../models/chatGroupModel');
const customError = require('../utils/customError');

const { validateUser, validateChatType, validateChatId, validateMessageContent,
     validateReplyMessage, validateChatMembership, handleFileUploads, findOrCreateDirectChat, updateUnreadCount, updateGroupUnreadCounts, validateMessageOwner} = require('../utils/chat');


// Create a new message.
const createMessage = async (req, res) => {
    try {
        const sender = req.user.id;
        const { type, messageText, replyTo, receiverId, chatId: providedChatId } = req.body;
        const messageAttachment = req.files;

        // Validate inputs
        await validateUser(sender);
        validateChatType(type);
        validateMessageContent(messageText, messageAttachment);

        if (replyTo) {
            await validateReplyMessage(replyTo);
        }

        // Determine chat ID and handle chat creation if necessary
        let chatId = providedChatId;
        let chatModel = type === 'direct' ? directChatModel : chatGroupModel;
        
        if (type === 'direct' && !chatId && receiverId) {
            const chat = await findOrCreateDirectChat(sender, receiverId);
            chatId = chat._id;
        } else {
            validateChatId(chatId);
            await validateChatMembership(chatModel, chatId, sender, type);
        }

        // Handle file uploads
        const attachmentsArray = await handleFileUploads(messageAttachment);
        const newMessage = new MessageModel({
            sender,
            chatId,
            type,
            messageText,
            messageAttachment: attachmentsArray,
            replyTo
        });

        const savedMessage = await newMessage.save();
        if (!savedMessage) {
            return res.status(500).json({ message: 'Failed to save message' });
        }

        // Update unread counts for group members or the receiver
        if (type === 'group') {
            await updateGroupUnreadCounts(chatId, sender);
        } else {
            await updateUnreadCount(receiverId, chatId);
        }

        // Update the chat with the new message
        const chat = await chatModel.findByIdAndUpdate(
            chatId,
            { $push: { messages: savedMessage._id } },
            { new: true }
        );
        console.log("chat id: ", chatId)

        if (!chat) {
            return res.status(404).json({ message: `${type === 'direct' ? 'Direct' : 'Group'} chat not found` });
        }

        res.status(200).json({ message: 'Message created successfully', data: savedMessage, chat: chat });
    } catch (err) {
        if (err instanceof customError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error('Error creating message:', err);
            res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }
};

// Get a message.
const getMessage = async (req, res) => {
    res.status(200).json({ message: 'Dummy data' });
};

// Update a message. patch request. only message text could be updated
const editMessage = async (req, res) => {
    try {
        const messageId = req.params.messageId;
        const { messageText } = req.body;
        if (!messageText) {
            throw new customError('Message text is required', 400);
        }

        validateMessageOwner(messageId, req.user.id);
        const updatedMessage = await MessageModel.findByIdAndUpdate(
            messageId,
            { messageText },
            { new: true }
        );
        if (!updatedMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.status(200).json({ message: 'Message updated successfully', updatedMessage: updatedMessage });
    } catch (err) {
        if (err instanceof customError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error('Error updating message:', err);
            res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }
};

// Delete a message.
const deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.messageId;
        validateMessageOwner(messageId, req.user.id);

        const deletedMessage = await MessageModel.findByIdAndUpdate(
            messageId,
            { isDeleted: true },
            { new: true }
        );
        if (!deletedMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // if the message was unread and deleted, should we update the unread count ????
        
        res.status(200).json({ message: 'Message deleted successfully', data: deletedMessage });

    } catch (err) {
        if (err instanceof customError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error('Error deleting message:', err);
            res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }
};

module.exports = {
    createMessage,
    getMessage,
    editMessage,
    deleteMessage
};