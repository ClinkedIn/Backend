const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect, mockVerifyToken } = require('../middlewares/auth');

// Routes for creating and getting chats.
router.route('/direct-chat')
    .post(mockVerifyToken, chatController.createDirectChat)

router.route('/direct-chat/:chatId')
    .get(mockVerifyToken, chatController.getDirectChat)
    .put(mockVerifyToken, chatController.updateDirectChat)

router.route('/group-chat')
    .post(mockVerifyToken, chatController.createGroupChat)

router.route('group-chat/:groupId')
    .get(mockVerifyToken, chatController.getGroupChat)
    .put(mockVerifyToken, chatController.updateGroupChat);

router.route('/mark-as-read/:chatId')
    .patch(mockVerifyToken, chatController.markChatAsRead);

router.route('/all-chats')
    .get(mockVerifyToken, chatController.getAllChats);


module.exports = router;