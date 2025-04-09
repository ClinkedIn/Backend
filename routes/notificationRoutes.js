/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middlewares/auth");

router.route("/").get(protect, notificationController.getNotifications);
router.route("/mark-read/:id").patch(protect, notificationController.markRead);
router
  .route("/mark-unread/:id")
  .patch(protect, notificationController.markUnread);

router
  .route("/unread-count")
  .get(protect, notificationController.getUnreadNotificationsCount);

router
  .route("/pause-notifications")
  .patch(protect, notificationController.pauseNotifications);

router
  .route("/resume-notifications")
  .patch(protect, notificationController.resumeNotifications);

router
  .route("/delete-notification/:id")
  .delete(protect, notificationController.deleteNotification);

router
  .route("/restore-notification/:id")
  .patch(protect, notificationController.restoreNotification);

module.exports = router;
