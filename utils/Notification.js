/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { shouldUseFlatConfig } = require("eslint/use-at-your-own-risk");
const Notification = require("./../models/notificationModel");
const userModel = require("./../models/userModel");
const admin = require("./firebase");
const { getMessaging } = require("firebase-admin/messaging");

// reaction, comment, follow, message, mention, tag, share, post,connectionRequest, connectionAccepted, connectionRejected

const notificationTemplate = {
  reaction: (sendingUser, reactionType) => {
    const message = {
      title: `${sendingUser.name} reacted with ${reactionType} to your post`,
      body: `Tap to view the post`,
    };
    return message;
  },
  comment: (sendingUser) => {
    const message = {
      title: `${sendingUser.name} commented on your post`,
      body: `Tap to view the comment`,
    };
    return message;
  },
  follow: (sendingUser) => {
    const message = {
      title: `${sendingUser.name} started following you`,
      body: `Tap to view their profile`,
    };
    return message;
  },
  message: (sendingUser) => {
    const message = {
      title: `${sendingUser.name} sent you a message`,
      body: `Tap to view the message`,
    };
    return message;
  },
  chatMessage: (sendingUser, chatMessage) => {
    const message = {
      title: `${sendingUser.name} sent you a message`,
      body: chatMessage,
    };
    return message;
  },
  mention: (sendingUser) => {
    const message = {
      title: `${sendingUser.name} mentioned you in a comment`,
      body: `Tap to view the comment`,
    };
    return message;
  },
  tag: (sendingUser) => {
    const message = {
      title: `${sendingUser.name} tagged you in a post`,
      body: `Tap to view the post`,
    };
    return message;
  },
  repost: (sendingUser) => {
    const message = {
      title: `${sendingUser.name} shared your post`,
      body: `Tap to view the post`,
    };
    return message;
  },
  share: (sendingUser) => {
    const message = {
      title: `${sendingUser.name} shared a post`,
      body: `Tap to view the post`,
    };
    return message;
  },
  post: (sendingUser) => {
    const message = {
      title: `${sendingUser.name} created a new post`,
      body: `Tap to view the post`,
    };
    return message;
  },
  connectionRequest: (sendingUser) => {
    const message = {
      title: `${sendingUser.name} sent you a connection request`,
      body: `Tap to view the request`,
    };
    return message;
  },
  connectionAccepted: (sendingUser) => {
    const message = {
      title: `${sendingUser.name} accepted your connection request`,
      body: `Tap to view their profile`,
    };
    return message;
  },
  connectionRejected: (sendingUser) => {
    const message = {
      title: `${sendingUser.name} rejected your connection request`,
      body: `Tap to view their profile`,
    };
    return message;
  },
};

const sendNotification = async (
  sendingUser,
  recievingUser,
  subject,
  resource,
  reactionType = null,
  chatMessage = null
) => {
  try {
    const user = await userModel.findById(recievingUser.id);
    if (!user) {
      console.error("User not found:", recievingUser.id);
      return;
    }
    let messageStr = {};
    if (subject === "reaction") {
      messageStr = notificationTemplate[subject](sendingUser, reactionType);
    } else if (subject === "chatMessage") {
      messageStr = notificationTemplate[subject](sendingUser, chatMessage);
    } else {
      messageStr = notificationTemplate[subject](sendingUser);
    }
    const notification = await Notification.create({
      from: sendingUser.id,
      to: recievingUser.id,
      subject: subject,
      title: messageStr.title,
      content: messageStr.body,
      resourceId: resource.id,
    });

    const fcmToken = user.fcmToken;
    if (!fcmToken) {
      console.error(
        "FCM token not found for user:",
        recievingUser.firstName + " " + recievingUser.lastName
      );
      return;
    }
    const message = {
      notification: {
        title: messageStr.title,
        body: messageStr.body,
      },
      data: {
        subject: subject,
        resourceId: resource.id,
      },
      token: fcmToken,
    };
    getMessaging()
      .send(message)
      .then((response) => {
        console.log("Successfully sent message:", response);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};

module.exports = sendNotification;
