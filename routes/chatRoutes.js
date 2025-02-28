const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');


// Routes for creating and getting chats.
router.route('/direct-chat')
    .post( chatController.createDirectChat)

router.route('/direct-chat/:chatId')
    .get(chatController.getDirectChat)
    .put(chatController.updateDirectChat)

router.route('/group-chat')
    .post(chatController.createGroupChat)

router.route('group-chat/:groupId')
    .get(chatController.getGroupChat)
    .put(chatController.updateGroupChat);

router.route('/all-chats')
    .get(chatController.getAllChats);

module.exports = router;