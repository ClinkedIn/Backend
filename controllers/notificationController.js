/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const Notification = require("../models/notificationModel");
const userModel = require("../models/userModel");
const APIFeatures = require("./../utils/apiFeatures");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const features = new APIFeatures(
      Notification.find({ to: userId }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const notifications = await features.query;

    if (!notifications) {
      return res.status(404).json({ message: "No notifications found" });
    }

    const response = [];
    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i];
      const fromUser = await userModel.findById(notification.from);
      response.push({
        ...notification._doc,
        sendingUser: {
          email: fromUser.email,
          firstName: fromUser.firstName,
          lastName: fromUser.lastName,
          profilePicture: fromUser.profilePicture,
        },
      });
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Internal server Error", error });
  }
};

const markRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server Error", error });
  }
};

const markUnread = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = false;
    await notification.save();

    return res.status(200).json({ message: "Notification marked as unread" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server Error", error });
  }
};

module.exports = {
  getNotifications,
  markRead,
  markUnread,
};
