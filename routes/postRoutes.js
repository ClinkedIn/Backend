const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

router.route('/')
    .post(protect,upload.array('files'),postController.createPost)
    .get(protect,postController.getAllPosts);

router.route('/:postId')
    .get(protect,postController.getPost)
    .put(protect,postController.updatePost)
    .delete(protect,postController.deletePost);

router.route('/:postId/save')
    .post(protect,postController.savePost)
    .delete(protect,postController.unsavePost);

router.route('/:postId/like')
    .post(protect,postController.likePost)
    .delete(protect,postController.unlikePost)
    .get(protect,postController.getPostImpressions);

router.route('/:postId/repost')
    .post(protect,postController.repostPost)
    .get(protect,postController.getPostReposts);

router.route('/:repostId/repost')
    .delete(protect,postController.deleteRepost);


router.route('/:postId/report')
    .post(protect,postController.reportPost);




module.exports = router;

