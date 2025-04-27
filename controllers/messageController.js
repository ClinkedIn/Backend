const MessageModel = require("../models/chatMessageModel");
const userModel = require("../models/userModel");
const directChatModel = require("../models/directChatModel");
const chatGroupModel = require("../models/chatGroupModel");
const mongoose = require("mongoose");
const customError = require("../utils/customError");

const {
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
  isSenderBlocked,
  calculateTotalUnreadCount,
  markMessageReadByUser,
} = require("../utils/chatUtils");
const { sendNotification } = require("../utils/Notification");

// Create a new message.
const sendMessage = async (req, res) => {
  try {
    const sender = req.user.id;
    const { type, messageText, replyTo } = req.body;
    let { receiverId, chatId: providedChatId } = req.body;
    const messageAttachment = req.files;

    // Validate inputs
    const senderModel = await userModel.findById(sender);
        if (!senderModel) {
            throw new customError('User not found', 404);
      }

      if (type !== 'direct') {
        throw new customError('Invalid chat type', 400);
    }
    
    if (!messageText && (!messageAttachment || messageAttachment.length === 0)) {
      throw new customError('Message content is required', 400);
  }

    if (replyTo) {
      await validateReplyMessage(replyTo);
    }

    let chatId = providedChatId;
    let chatModel = directChatModel;
    
    if (!receiverId && chatId) {
      const chat = await chatModel.findById(chatId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      receiverId = chat.secondUser.toString() === sender ? chat.firstUser : chat.secondUser;
      await validateChatMembership(chatModel, chatId, sender, type);
    }
    
    if (!chatId) {
      const chat = await findOrCreateDirectChat(sender, receiverId);
      chatId = chat._id;
    }

    if (await isSenderBlocked(sender, receiverId)) {
      return res
        .status(403)
        .json({ message: "Sender is blocked by the receiver" });
    }

    // Handle file uploads
    const attachmentsArray = await handleFileUploads(messageAttachment);
    const newMessage = new MessageModel({
      sender,
      chatId,
      type,
      messageText,
      messageAttachment: attachmentsArray,
      replyTo,
    });

    const savedMessage = await newMessage.save();
    if (!savedMessage) {
      return res.status(500).json({ message: "Failed to save message" });
    }

    await updateUnreadCount(receiverId, chatId, "DirectChat");

    const chat = await chatModel.findByIdAndUpdate(
      chatId,
      { $push: { messages: savedMessage._id } },
      { new: true }
    );

    if (!chat) {
      return res
        .status(404)
        .json({
          message: `${type === "direct" ? "Direct" : "Group"} chat not found`,
        });
    }

    // send notification to receiver
    const receiver = await userModel.findById(receiverId);
    sendNotification(senderModel, receiver, "message", savedMessage)
      .then(() => {
        console.log("Notification sent successfully");
      })
      .catch((error) => {
        console.error("Failed to send notification:", error);
      });
    
    res
      .status(200)
      .json({ message: "Message created successfully", data: savedMessage });
  } catch (err) {
    if (err instanceof customError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      console.error("Error creating message:", err);
      res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }
  }
};

// Update a message. patch request. only message text could be updated
const editMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const { messageText } = req.body;
    if (!messageText) {
      throw new customError("Message text is required", 400);
    }

    validateMessageOwner(messageId, req.user.id);

    // Check if message isDeleted = true deleted

    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { messageText },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (updatedMessage.isDeleted) {
      return res
        .status(400)
        .json({ message: "Cannot update a deleted message" });
    }

    res
      .status(200)
      .json({
        message: "Message updated successfully",
        updatedMessage: updatedMessage,
      });
  } catch (err) {
    if (err instanceof customError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      console.error("Error updating message:", err);
      res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
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
      return res.status(404).json({ message: "Message not found" });
    }

    // if the message was unread and deleted, should we update the unread count ????

    res
      .status(200)
      .json({ message: "Message deleted successfully", data: deletedMessage });
  } catch (err) {
    if (err instanceof customError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      console.error("Error deleting message:", err);
      res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }
  }
};


const blockUserFromMessaging = async (req, res) => {
  try {
    const userId = req.user.id;
    const blockedUserId = req.params.userId;

    if (!blockedUserId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const blockedUser = userModel.findById(blockedUserId);
    if (!blockedUser) {
      return res.status(404).json({ message: "Blocked user not found" });
    }

    if (user.blockedFromMessaging.includes(blockedUserId)) {
      return res.status(400).json({ message: "User is already blocked" });
    }
    
    user.blockedFromMessaging.push(blockedUserId);
    await user.save();
    
    res.status(200).json({ message: "User blocked successfully" });
  } catch (err) {
    if (err instanceof customError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      console.error("Error blocking user:", err);
      res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }
  }
};

const unblockUserFromMessaging = async (req, res) => {
  try {
    const userId = req.user.id;
    const blockedUserId = req.params.userId;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.blockedFromMessaging = user.blockedFromMessaging.filter(
      (id) => id.toString() !== blockedUserId.toString()
    );

    await user.save();
    const updatedUser = await userModel.findById(userId);

    res.status(200).json({
      message: "User unblocked successfully",
      blockedUsers: updatedUser.blockedFromMessaging,
    });
  } catch (err) {
    console.error("Error unblocking user:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

const getTotalUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const userExists = await userModel.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalUnread = await calculateTotalUnreadCount(userId);

    res.status(200).json({
      message: "Total unread count fetched successfully",
      totalUnread: totalUnread,
    });
  } catch (err) {
    if (err instanceof customError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      console.error("Error getting total unread count:", err);
      res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user.id;

    const  updatedMessage  = await markMessageReadByUser(
      messageId,
      userId
    );

    res.status(200).json({
      message: "Message marked as read successfully",
    });
  } catch (err) {
    if (err instanceof customError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      console.error("Error marking message as read:", err);
      res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }
  }
};

const isUserBlocked = async (req, res) => {
  try {
    const userId = req.user.id;
    const blockedUserId = req.params.userId;

    if (!blockedUserId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isBlocked = user.blockedFromMessaging.includes(blockedUserId);

    res.status(200).json({
      isBlocked,
    });
  } catch (err) {
    console.error("Error checking block status:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

module.exports = {
  sendMessage,
  editMessage,
  deleteMessage,
  blockUserFromMessaging,
  unblockUserFromMessaging,
  getTotalUnreadCount,
  markMessageAsRead,
  isUserBlocked
};
