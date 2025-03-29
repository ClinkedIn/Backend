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
module.exports = router;
