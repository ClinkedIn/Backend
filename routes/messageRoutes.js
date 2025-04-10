const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect, mockVerifyToken } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

router.route('/')
    .post(mockVerifyToken, upload.array('files', 10), messageController.sendMessage);

router.route('/:messageId')
    .delete(protect, messageController.deleteMessage)
    .patch(mockVerifyToken, messageController.editMessage);

router.route('/unread-count')
    .get(mockVerifyToken, messageController.getTotalUnreadCount);

router.route('/block-user/:userId')
    .patch(protect, messageController.blockUserFromMessaging);

router.route('/unblock-user/:userId')
    .patch(protect, messageController.unblockUserFromMessaging);

router.route('/read-receipt/:messageId')
    .patch(protect, messageController.markMessageAsRead);

module.exports = router;

