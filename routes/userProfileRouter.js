const express = require('express');
const router = express.Router();
const { verifyToken, isLoggedIn, verifyGoogleToken, mockVerifyToken } = require('../middlewares/auth');

const user = require('../controllers/userProfileController');

router.route('/education')
    .patch(mockVerifyToken,user.addEducation)

router.route('/profile')
    .patch(mockVerifyToken,user.editIntro)

router.route('/experience')
    .put(mockVerifyToken, user.addExpperience)

module.exports = router;