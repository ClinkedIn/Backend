/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { shouldUseFlatConfig } = require("eslint/use-at-your-own-risk");
const Notification = require("./../models/notificationModel");
const userModel = require("./../models/userModel");
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

const sendNotification = async (
  sendingUser,
  recievingUser,
  subject,
  resource
) => {
  try {
    if (sendingUser.id === recievingUser.id) {
      return;
    }
    const user = await userModel.findById(recievingUser.id);
    if (!user) {
      console.error("User not found:", recievingUser.id);
      return;
    }
    if (user.notificationPauseExpiresAt !== null) {
      if (user.notificationPauseExpiresAt > new Date()) {
        console.log("User has paused notifications:", user.id);
        return;
      }
    }

    let messageStr = {};
    if (subject === "impression") {
      if (resource.targetType === "Post") {
        messageStr = notificationTemplate["reactionPost"](
          sendingUser,
          resource.type
        );
      } else if (resource.targetType === "Comment") {
        messageStr = notificationTemplate["reactionComment"](
          sendingUser,
          resource.type
        );
      }
    } else {
      messageStr = notificationTemplate[subject](sendingUser);
    }
    const notification = await Notification.create({
      from: sendingUser.id,
      to: recievingUser.id,
      subject: subject,
      content: messageStr.body,
      resourceId: resource.id,
    });

    const fcmTokens = user.fcmToken;
    if (!fcmTokens || fcmTokens.length === 0) {
      console.error(
        "FCM tokens not found for user:",
        recievingUser.firstName + " " + recievingUser.lastName
      );
      return;
    }

    const message = {
      notification: {
        body: messageStr.body,
      },
      data: {
        subject: subject,
        resourceId: resource.id,
      },
      tokens: fcmTokens,
    };

    getMessaging()
      .sendEachForMulticast(message)
      .then((response) => {
        if (response.failureCount > 0) {
          const failedTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push(fcmTokens[idx]);
            }
          });
          console.log("List of tokens that caused failures:", failedTokens);
        }
      })
      .catch((error) => {
        console.error("Error sending messages:", error);
      });
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};

module.exports = sendNotification;
