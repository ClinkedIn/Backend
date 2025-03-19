const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/multer');
router.route('/')
    .post(protect,upload.array('files'),postController.createPost)
    .get(protect,postController.getAllPosts);


router.route('/:postId')
    .get(postController.getPost)
    .put(protect,postController.updatePost)
    .delete(protect,postController.deletePost);

router.route('/:postId/save')
    .post(protect,postController.savePost)
    .delete(postController.unsavePost);

router.route('/:postId/like')
    .post(postController.likePost)
    .delete(postController.unlikePost); 

router.route('/:postId/repost')
    .post(postController.repostPost);

router.route('/:postId/repost/:repostId')
    .delete(postController.deleteRepost);


router.route('/:postId/report')
    .post(postController.reportPost);
    

module.exports = router;

