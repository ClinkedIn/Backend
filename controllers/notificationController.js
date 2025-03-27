/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const Notification = require("../models/notificationModel");
const userModel = require("../models/userModel");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have a middleware that sets req.user
    const notifications = await Notification.find({ to: userId }).sort({
      createdAt: -1,
    });

    if (!notifications) {
      return res.status(404).json({ message: "No notifications found" });
    }

    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: "Internal server Error" });
  }
};

module.exports = {
  getNotifications,
};
