const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');


// Routes for creating and getting chats.
router.route('/direct-chat')
    .post( chatController.createDirectChat)
    .get(chatController.getDirectChat);

router.route('/direct-chat/:chatId/update-direct-chat')
    .put(chatController.updateDirectChat);

router.route('/group-chat')
    .post(chatController.createGroupChat)
    .get(chatController.getGroupChat);

router.route('group-chat/:chatId/update-group-chat')
    .put(chatController.updateGroupChat);

router.route('/all-chats')
    .get(chatController.getAllChats);

module.exports = router;