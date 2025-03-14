const express = require('express');
const router = express.Router();
const { verifyToken, isLoggedIn, verifyGoogleToken, mockVerifyToken } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

const user = require('../controllers/userProfileController');

router.route('/education')
    .patch(mockVerifyToken,user.addEducation);

router.route('/profile')
    .patch(mockVerifyToken,user.editIntro);

router.route('/experience')
    .post(mockVerifyToken, user.addExperience)
    .get(mockVerifyToken, user.getUserExperiences);

router.route('/experience/:index')
    .put(mockVerifyToken,  user.updateExperience);

router.route('/skills')
    .post(mockVerifyToken, user.addSkill)
    .get(mockVerifyToken, user.getUserSkills);

router.route('/skills/:index')
    .put(mockVerifyToken,  user.updateSkill)
    .delete(mockVerifyToken, user.deleteSkill)

router.route('/add-profile-picture')
    .post(mockVerifyToken, upload.single('file'), user.uploadProfilePicture);

router.post('/add-cover-picture', upload.single('file'), user.uploadCoverPicture);

module.exports = router;