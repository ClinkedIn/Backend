const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");
const searchController = require("../controllers/searchController");
const postController = require("../controllers/postController");
const comment = require("../controllers/commentController");
const { protect, mockVerifyToken } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

router.route('/users')
    .get(protect, searchController.searchUsers);
router.route('/jobs')
    .get(searchController.searchJobs);
module.exports = router;
router.route('/posts')
    .get(protect, postController.searchPostsByKeyword);