const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect, mockVerifyToken } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

router.route('/unread-count')
    .get(protect, messageController.getTotalUnreadCount);

router.route('/block-user/:userId')
    .patch(protect, messageController.blockUserFromMessaging);

router.route('/unblock-user/:userId')
    .patch(protect, messageController.unblockUserFromMessaging);

router.route('/read-receipt/:messageId')
    .patch(protect, messageController.markMessageAsRead);

router.route('/:messageId')
    .delete(protect, messageController.deleteMessage)
    .patch(protect, messageController.editMessage);

router.route('/')
    .post(protect, upload.array('files', 10), messageController.sendMessage);

module.exports = router;

