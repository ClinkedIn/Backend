const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.route('/messages')
    .post(messageController.createMessage)

router.route('/messages/:messageId')
    .get(messageController.getMessage)
    .put(messageController.updateMessage)
    .delete(messageController.deleteMessage)

module.exports = router;

