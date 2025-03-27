/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const Notification = require("./../models/notificationModel");
const userModel = require("./../models/userModel");
const admin = require("./firebase");
const { getMessaging } = require("firebase-admin/messaging");

const notificationTemplate = {
  reaction: (sendingUser) => {
    const message = {};
  },
};

const sendNotification = async (sendingUser, recievingUser, subject, text) => {
  try {
    const user = await userModel.findById(recievingUser.id);
    if (!user) {
      return;
    }
    const notification = await Notification.create({
      from: sendingUser.id,
      to: recievingUser.id,
      subject,
      text,
    });
    const fcmToken = user.fcmToken;
    if (!fcmToken) {
      return;
    }
    const message = {
      notification: {
        title: notificationTemplate[subject](sendingUser),
        body: text,
      },
      token: fcmToken,
    };
    try {
      await getMessaging().send(message);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};

module.exports = sendNotification;
