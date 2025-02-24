const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.route('/')
    .post(postController.createPost)
    .get(postController.getAllPosts);


router.route('/:postId')
    .get(postController.getPost)
    .put(postController.updatePost)
    .delete(postController.deletePost);


router.route('/:postId/save')
    .post(postController.savePost)
    .delete(postController.unsavePost);


router.route('/:postId/like')
    .post(postController.likePost)

router.route('/:postId/like/:userId')
    .delete(postController.unlikePost);

router.route('/:postId/comment')
    .post(postController.commentPost);


router.route('/:postId/comment/:commentId')
    .delete(postController.deleteComment);


router.route('/:postId/repost')
    .post(postController.repostPost);


router.route('/:postId/repost/:repostId')
    .delete(postController.deleteRepost);


router.route('/:postId/report')
    .post(postController.reportPost);



module.exports = router;

