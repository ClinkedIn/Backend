const MessageModel = require("../models/chatMessageModel");
const userModel = require("../models/userModel");
const directChatModel = require("../models/directChatModel");
const chatGroupModel = require("../models/chatGroupModel");
const mongoose = require("mongoose");
const customError = require("../utils/customError");
// connect to firebase
const admin = require("firebase-admin");

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

    const conversationId = chatId.toString(); // Use the MongoDB chatId
    
    console.log("Message URL: ", savedMessage.messageAttachment)

    const receiver = await userModel.findById(receiverId);
    const receiverfirebase = receiver;

    // Add Message to Firestore using Admin SDK
    const messageDataForFirestore = {
      senderId: sender,
      text: messageText || "",
      mediaUrl: savedMessage.messageAttachment || [],
      mediaType: [],
      readBy: {[sender]: true , [receiverId] : false},
      timestamp: admin.firestore.FieldValue.serverTimestamp(), // Server timestamp
    };
    if (replyTo) {
      messageDataForFirestore.replyToId = replyTo;
    }

    const messageId = savedMessage._id.toString();

    // Add message to Firestore
    await admin.firestore()
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .doc(messageId)  // Use the MongoDB ID here
      .set(messageDataForFirestore);

    console.log("Message added to Firestore conversation:", conversationId);

    // Update conversation metadata
    const conversationUpdateData = {
      lastMessage: {
        text: messageText || "(attachment)",
        senderId: sender,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      },
      
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      participants: [sender, receiverId].sort(),
      fullName:{
        [sender]: senderModel.firstName + " " + senderModel.lastName,
        [receiverId]: receiverfirebase.firstName + " " + receiverfirebase.lastName
      },
      profilePicture:{
        [sender]: senderModel.profilePicture,
        [receiverId]: receiverfirebase.profilePicture
      },
      typing: {
        [sender]: false,
        [receiverId]: false
      },
      forceUnread: {
        [sender]: false,
        [receiverId]: false
      }
    };

    // Get current unread counts
    const convDoc = await admin.firestore()
      .collection('conversations')
      .doc(conversationId)
      .get();
    
    const currentUnreadCounts = convDoc.exists ? (convDoc.data()?.unreadCounts || {}) : {};
    const receiverUnreadCount = (currentUnreadCounts[receiverId] || 0) + 1;

    // Update unread count
    conversationUpdateData.unreadCounts = {
      ...currentUnreadCounts,
      [receiverId]: receiverUnreadCount,
      [sender]: 0 // Reset sender's unread count
    };

    // Update Firestore conversation document
    await admin.firestore()
      .collection('conversations')
      .doc(conversationId)
      .set(conversationUpdateData, { merge: true });

    console.log("Firestore conversation metadata updated:", conversationId);


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

    const message = await MessageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    if (message.isDeleted) {
      return res.status(400).json({ message: "Cannot update a deleted message" });
    }

    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { messageText, updatedAt: Date.now() },
      { new: true }
    );

    console.log(`Attempting to update Firestore message ${messageId} in conversation ${updatedMessage.chatId}`);

    // Firestore reference
    const conversationId = updatedMessage.chatId.toString();
    const messageDocRef = admin.firestore()
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .doc(messageId);

    await messageDocRef.update({
      text: messageText,
      editedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Message updated successfully in Firestore.");

    const conversationRef = admin.firestore().collection("conversations").doc(conversationId);
    await conversationRef.update({
      "lastMessage.text": messageText,
      "lastMessage.timestamp": admin.firestore.FieldValue.serverTimestamp(),
      "lastUpdatedAt": admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      message: "Message updated successfully",
      updatedMessage,
    });

  } catch (err) {
    console.error("Error updating message:", err);
    res.status(err instanceof customError ? err.statusCode : 500).json({
      message: err.message || "Internal server error",
    });
  }
};

// Delete a message.
const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    validateMessageOwner(messageId, req.user.id);

    const deletedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      {
        isDeleted: true,
        messageText: "This message is deleted",
        messageAttachment: [] // Clear attachments
      },
      { new: true }
    );

    if (!deletedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Update the message in Firebase
    try {
      const conversationId = deletedMessage.chatId.toString();

      // Update the message in Firestore
      await admin.firestore()
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .doc(messageId)
        .update({
          text: "This message is deleted",
          mediaUrl: [],
          mediaType: [],
          isDeleted: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      console.log(`Message ${messageId} marked as deleted in Firestore`);
    } catch (firebaseErr) {
      console.error("Error updating message in Firestore:", firebaseErr);
    }

    res.status(200).json({
      message: "Message deleted successfully",
      data: deletedMessage
    });
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
    const blockedUser = await userModel.findById(blockedUserId);
    if (!blockedUser) {
      return res.status(404).json({ message: "Blocked user not found" });
    }

    if (user.blockedFromMessaging.includes(blockedUserId)) {
      return res.status(400).json({ message: "User is already blocked" });
    }
    
    // Update MongoDB
    user.blockedFromMessaging.push(blockedUserId);
    await user.save();

    try {
      // Update Firebase - add to the blockedUsers array
      const userFirebaseDoc = admin.firestore().collection('user').doc(userId);
      
      // Check if user document exists
      const userDoc = await userFirebaseDoc.get();
      
      if (userDoc.exists) {
        // User exists, update the blockedUsers array
        await userFirebaseDoc.update({
          blockedUsers: admin.firestore.FieldValue.arrayUnion(blockedUserId)
        });
      } else {
        // User doesn't exist in Firebase, create it with blockedUsers
        await userFirebaseDoc.set({
          blockedUsers: [blockedUserId],
        });
      }
      
      console.log(`User ${blockedUserId} blocked successfully in Firebase`);
    } catch (firebaseErr) {
      console.error("Error updating blocked users in Firebase:", firebaseErr);
      // Continue with response as MongoDB update was successful
    }
    
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

    // Update MongoDB
    user.blockedFromMessaging = user.blockedFromMessaging.filter(
      (id) => id.toString() !== blockedUserId.toString()
    );
    await user.save();
    
    try {
      // Update Firebase - remove from blockedUsers array
      const userFirebaseDoc = admin.firestore().collection('user').doc(userId);
      
      // Check if user document exists
      const userDoc = await userFirebaseDoc.get();
      
      if (userDoc.exists) {
        // Remove user from the blockedUsers array
        await userFirebaseDoc.update({
          blockedUsers: admin.firestore.FieldValue.arrayRemove(blockedUserId)
        });
        
        console.log(`User ${blockedUserId} unblocked successfully in Firebase`);
      } else {
        console.warn(`User document not found in Firebase for ID: ${userId}`);
      }
    } catch (firebaseErr) {
      console.error("Error updating unblock in Firebase:", firebaseErr);
      // Continue with response as MongoDB update was successful
    }
    
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

    // Update MongoDB
    const updatedMessage = await markMessageReadByUser(
      messageId,
      userId
    );

    if (!updatedMessage) {
      throw new customError('Message not found', 404);
    }

    // Update in Firebase
    try {
      const conversationId = updatedMessage.chatId.toString();
      
      // Update readBy field in the message document
      await admin.firestore()
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .doc(messageId)
        .update({
          [`readBy.${userId}`]: true,
          readAt: admin.firestore.FieldValue.serverTimestamp()
        });

      console.log(`Message ${messageId} marked as read in Firestore`);

      // Get current conversation data to update unread counts
      const conversationDoc = await admin.firestore()
        .collection('conversations')
        .doc(conversationId)
        .get();
        
      if (conversationDoc.exists) {
        const conversationData = conversationDoc.data();
        const currentUnreadCounts = conversationData.unreadCounts || {};
        
        // Update unread counts in the conversation document
        await admin.firestore()
          .collection('conversations')
          .doc(conversationId)
          .update({
            [`unreadCounts.${userId}`]: 0,
            [`forceUnread.${userId}`]: false
          });
          
        console.log(`Unread count reset for user ${userId} in conversation ${conversationId}`);
      }
    } catch (firebaseErr) {
      console.error("Error updating message read status in Firebase:", firebaseErr);
    }

    res.status(200).json({
      message: "Message marked as read successfully"
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