const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect, mockVerifyToken } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

router.route('/')
    .post(mockVerifyToken, upload.array('files', 10), messageController.createMessage);

router.route('/:messageId')
    .get(mockVerifyToken, messageController.getMessage)
    .delete(mockVerifyToken, messageController.deleteMessage)
    .patch(mockVerifyToken, messageController.editMessage);

module.exports = router;

