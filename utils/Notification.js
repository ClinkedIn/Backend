/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { shouldUseFlatConfig } = require("eslint/use-at-your-own-risk");
const Notification = require("./../models/notificationModel");
const userModel = require("./../models/userModel");
const commentModel = require("./../models/commentModel");
const admin = require("./firebase");
const { getMessaging } = require("firebase-admin/messaging");
const { body } = require("express-validator");

// reaction, comment, follow, message, mention, tag, share, post,connectionRequest, connectionAccepted, connectionRejected

const notificationTemplate = {
  reactionPost: (sendingUser, reactionType) => {
    const message = {
      body: `${sendingUser.firstName} ${sendingUser.lastName} reacted with ${reactionType} to your post`,
    };
    return message;
  },
  reactionComment: (sendingUser, reactionType) => {
    const message = {
      body: `${sendingUser.firstName} ${sendingUser.lastName} reacted with ${reactionType} to your comment`,
    };
    return message;
  },
  comment: (sendingUser) => {
    const message = {
      body: `${sendingUser.firstName} ${sendingUser.lastName} commented on your post`,
    };
    return message;
  },
  follow: (sendingUser) => {
    const message = {
      body: `${sendingUser.firstName} ${sendingUser.lastName} started following you`,
    };
    return message;
  },
  message: (sendingUser) => {
    const message = {
      body: `${sendingUser.firstName} ${sendingUser.lastName} sent you a message`,
    };
    return message;
  },
  mention: (sendingUser) => {
    const message = {
      body: `${sendingUser.firstName} ${sendingUser.lastName} mentioned you in a comment`,
    };
    return message;
  },
  tag: (sendingUser) => {
    const message = {
      body: `${sendingUser.firstName} ${sendingUser.lastName} tagged you in a post`,
    };
    return message;
  },
  repost: (sendingUser) => {
    const message = {
      body: `${sendingUser.firstName} ${sendingUser.lastName} shared your post`,
    };
    return message;
  },
  share: (sendingUser) => {
    const message = {
      body: `${sendingUser.firstName} ${sendingUser.lastName} shared a post`,
    };
    return message;
  },
  post: (sendingUser) => {
    const message = {
      body: `${sendingUser.firstName} ${sendingUser.lastName} created a new post`,
    };
    return message;
  },
  connectionRequest: (sendingUser) => {
    const message = {
      body: `${sendingUser.firstName} ${sendingUser.lastName} sent you a connection request`,
    };
    return message;
  },
  connectionAccepted: (sendingUser) => {
    const message = {
      body: `${sendingUser.firstName} accepted your connection request`,
    };
    return message;
  },
  connectionRejected: (sendingUser) => {
    const message = {
      body: `${sendingUser.firstName} ${sendingUser.lastName} rejected your connection request`,
    };
    return message;
  },
};

const generateMessage = (sendingUser, subject, resource) => {
  if (subject === "impression") {
    if (resource.targetType === "Post") {
      return notificationTemplate.reactionPost(sendingUser, resource.type);
    } else if (resource.targetType === "Comment") {
      return notificationTemplate.reactionComment(sendingUser, resource.type);
    }
  }
  return notificationTemplate[subject](sendingUser);
};

// Helper to build notification data based on the subject and resource
const buildNotificationData = async (
  sendingUser,
  recievingUser,
  subject,
  resource
) => {
  const baseData = {
    from: sendingUser.id,
    to: recievingUser.id,
    subject,
    content: "", // To be set after message is generated.
    resourceId: resource.id,
  };

  if (subject === "impression") {
    if (resource.targetType === "Post") {
      baseData.relatedPostId = resource.targetId;
    } else if (resource.targetType === "Comment") {
      const comment = await commentModel.findById(resource.targetId);
      if (!comment) {
        console.error("Comment not found:", resource.targetId);
        return null;
      }
      baseData.relatedPostId = comment.postId;
      baseData.relatedCommentId = comment._id;
    }
  } else if (subject === "comment") {
    baseData.relatedPostId = resource.postId;
  } else if (subject === "message") {
    baseData.relatedChatId = resource.chatId.toHexString();
  }
  return baseData;
};

const sendNotification = async (
  sendingUser,
  recievingUser,
  subject,
  resource
) => {
  try {
    // Prevent self-notifications
    if (sendingUser.id === recievingUser.id) return;

    const user = await userModel.findById(recievingUser.id);
    if (!user) {
      console.error("User not found:", recievingUser.id);
      return;
    }

    // Generate the message text
    const messageStr = generateMessage(sendingUser, subject, resource);
    if (!messageStr || !messageStr.body) {
      console.error("Failed to generate notification message.");
      return;
    }

    // Build notification data
    let notificationData = await buildNotificationData(
      sendingUser,
      recievingUser,
      subject,
      resource
    );
    if (!notificationData) {
      return;
    }
    notificationData.content = messageStr.body;

    // Create the notification record
    const notification = await Notification.create(notificationData);

    // Check and clear notification pause if applicable
    if (
      user.notificationPauseExpiresAt &&
      user.notificationPauseExpiresAt > new Date()
    ) {
      return;
    } else {
      user.notificationPauseExpiresAt = null;
      await user.save();
    }

    // Ensure FCM tokens are available
    const fcmTokens = user.fcmToken;
    if (!fcmTokens || fcmTokens.length === 0) {
      console.error(
        "FCM tokens not found for user:",
        `${recievingUser.firstName} ${recievingUser.lastName}`
      );
      return;
    }

    // Prepare the FCM message payload
    const fcmMessage = {
      notification: { body: messageStr.body },
      data: { subject, resourceId: resource.id },
      tokens: fcmTokens,
    };

    // Send the FCM message
    const messaging = getMessaging();
    const response = await messaging.sendEachForMulticast(fcmMessage);
    if (response.failureCount > 0) {
      const failedTokens = response.responses.reduce((acc, resp, idx) => {
        if (!resp.success) acc.push(fcmTokens[idx]);
        return acc;
      }, []);
      console.log("List of tokens that caused failures:", failedTokens);
    }
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};

module.exports = sendNotification;
