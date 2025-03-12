const express = require('express');
const router = express.Router();
const { verifyToken, isLoggedIn, verifyGoogleToken, mockVerifyToken } = require('../middlewares/auth');

const user = require('../controllers/userProfileController');

router.route('/education')
    .patch(mockVerifyToken,user.addEducation)

router.route('/profile')
    .patch(mockVerifyToken,user.editIntro)

router.route('/experience')
    .post(mockVerifyToken, user.addExperience)
    .get(mockVerifyToken, user.getUserExperiences)

router.route('/experience/:index')
    .put(mockVerifyToken,  user.updateExperience);

router.route('/skills')
    .post(mockVerifyToken, user.addSkill)
    .get(mockVerifyToken, user.getUserSkills)

router.route('/skills/:index')
    .put(mockVerifyToken,  user.updateSkill);


module.exports = router;