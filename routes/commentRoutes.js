const express = require('express');
const router = express.Router();
const comment = require("../controllers/commentController");

router.route('/')
    .post(comment.addComment)
   
router.route('/:commentId')
    .put(comment.updateComment)
    .delete(comment.deleteComment)
    .get(comment.getComment)

    
module.exports = router;