const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect, mockVerifyToken } = require('../middlewares/auth');

// Routes for creating and getting chats.
router.route('/direct-chat')
    .post(protect, chatController.createDirectChat)

router.route('/direct-chat/:chatId')
    .get(protect, chatController.getDirectChat);

router.route('/group-chat')
    .post(protect, chatController.createGroupChat)

router.route('/group-chat/:groupId')
    .get(protect, chatController.getGroupChat);

router.route('/all-chats')
    .get(protect, chatController.getAllChats);

router.route('/mark-as-read/:chatId')
    .patch(protect, chatController.markChatAsRead);

router.route('/mark-as-unread/:chatId')
    .patch(protect, chatController.markChatAsUnread);

module.exports = router;