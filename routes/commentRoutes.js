const express = require('express');
const router = express.Router();
const comment = require("../controllers/commentController");
const { protect, mockVerifyToken } = require('../middlewares/auth');
const upload = require('../middlewares/multer');
router.route('/')
    .post(protect,upload.single("file"),comment.addComment)
   
router.route('/:commentId')
    .put(protect,comment.updateComment)
    .delete(protect,comment.deleteComment)
    .get(protect,comment.getComment)

    
module.exports = router;